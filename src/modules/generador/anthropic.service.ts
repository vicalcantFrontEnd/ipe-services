import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ZodSchema } from 'zod';
import { PlainErrorException } from '../../common/exceptions';

const WEB_SEARCH_TOOL_TYPE = 'web_search_20250305';
const MAX_CONTINUATIONS = 4; // límite de reanudaciones por `pause_turn` (búsqueda web server-side)

// Precios de referencia (Sonnet 4.6, USD por 1M tokens) para estimar el costo en logs.
// Si se cambia ANTHROPIC_MODEL, el costo estimado deja de ser exacto.
const PRICE_INPUT_PER_M = 3;
const PRICE_OUTPUT_PER_M = 15;
const PRICE_CACHE_READ_PER_M = 0.3;
const PRICE_CACHE_WRITE_PER_M = 3.75;
const PRICE_WEB_SEARCH_PER_1K = 10;

interface GenerateStructuredParams<T> {
  system: string;
  userPrompt: string;
  tool: Anthropic.Tool;
  investigar: boolean;
  schema: ZodSchema<T>;
}

interface UsageTotals {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  webSearch: number;
}

@Injectable()
export class AnthropicService implements OnModuleInit {
  private readonly logger = new Logger(AnthropicService.name);
  private client?: Anthropic;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.config.get<string>('anthropic.ANTHROPIC_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY no configurada: el Generador de Diplomados responderá 503 hasta que se defina.',
      );
      return;
    }
    const workspaceId = this.config.get<string>('anthropic.ANTHROPIC_WORKSPACE_ID');
    this.client = new Anthropic({
      apiKey,
      // Necesario cuando la key es de organización (no scoped a un workspace).
      ...(workspaceId ? { defaultHeaders: { 'anthropic-workspace-id': workspaceId } } : {}),
    });
  }

  /**
   * Ejecuta una generación con salida estructurada. Inyecta el system prompt
   * clínico (con prompt caching), habilita web_search cuando `investigar`, lee
   * el bloque tool_use esperado y valida su contenido con zod.
   */
  async generateStructured<T>({
    system,
    userPrompt,
    tool,
    investigar,
    schema,
  }: GenerateStructuredParams<T>): Promise<T> {
    if (!this.client) {
      throw new PlainErrorException(
        'El generador no está configurado en el servidor (falta ANTHROPIC_API_KEY).',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const model = this.config.get<string>('anthropic.ANTHROPIC_MODEL', 'claude-sonnet-4-6');
    const maxTokens = this.config.get<number>('anthropic.ANTHROPIC_MAX_TOKENS', 8000);
    const webSearchMaxUses = this.config.get<number>('anthropic.ANTHROPIC_WEB_SEARCH_MAX_USES', 5);

    const tools: Anthropic.Messages.ToolUnion[] = investigar
      ? [tool, { type: WEB_SEARCH_TOOL_TYPE, name: 'web_search', max_uses: webSearchMaxUses }]
      : [tool];

    // Con búsqueda: 'auto' para que el modelo pueda buscar antes de entregar.
    // Sin búsqueda: forzamos la herramienta de salida.
    const toolChoice: Anthropic.Messages.ToolChoice = investigar ? { type: 'auto' } : { type: 'tool', name: tool.name };

    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userPrompt }];
    const usage: UsageTotals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, webSearch: 0 };

    try {
      for (let i = 0; i <= MAX_CONTINUATIONS; i++) {
        const response = await this.client.messages.create({
          model,
          max_tokens: maxTokens,
          system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
          tools,
          tool_choice: toolChoice,
          messages,
        });

        this.accumulateUsage(usage, response.usage);

        const toolUse = response.content.find(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use' && block.name === tool.name,
        );

        if (toolUse) {
          this.logCost(tool.name, model, usage);
          return this.validate(schema, toolUse.input);
        }

        // La búsqueda web server-side agotó su ciclo: reanudar la petición.
        if (response.stop_reason === 'pause_turn') {
          messages.push({ role: 'assistant', content: response.content });
          continue;
        }

        // No llamó a la herramienta y no es pausa reanudable → salir del bucle.
        break;
      }
    } catch (err) {
      if (err instanceof PlainErrorException) throw err;
      this.logger.error(`Error al llamar a Anthropic: ${(err as Error).message}`, (err as Error).stack);
      throw new PlainErrorException(
        'No se pudo generar el contenido en este momento. Inténtalo de nuevo.',
        HttpStatus.BAD_GATEWAY,
      );
    }

    throw new PlainErrorException('El modelo no devolvió contenido estructurado.', HttpStatus.BAD_GATEWAY);
  }

  private validate<T>(schema: ZodSchema<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      this.logger.error(`Salida del modelo inválida: ${result.error.message}`);
      throw new PlainErrorException('El modelo devolvió contenido con formato inesperado.', HttpStatus.BAD_GATEWAY);
    }
    return result.data;
  }

  /** Suma el uso de tokens/búsquedas de una respuesta al acumulado. */
  private accumulateUsage(totals: UsageTotals, u: Anthropic.Usage): void {
    totals.input += u.input_tokens ?? 0;
    totals.output += u.output_tokens ?? 0;
    totals.cacheRead += u.cache_read_input_tokens ?? 0;
    totals.cacheWrite += u.cache_creation_input_tokens ?? 0;
    totals.webSearch += u.server_tool_use?.web_search_requests ?? 0;
  }

  /** Registra el costo estimado de la generación en los logs. */
  private logCost(toolName: string, model: string, u: UsageTotals): void {
    const cost =
      (u.input / 1_000_000) * PRICE_INPUT_PER_M +
      (u.output / 1_000_000) * PRICE_OUTPUT_PER_M +
      (u.cacheRead / 1_000_000) * PRICE_CACHE_READ_PER_M +
      (u.cacheWrite / 1_000_000) * PRICE_CACHE_WRITE_PER_M +
      (u.webSearch / 1_000) * PRICE_WEB_SEARCH_PER_1K;
    const exacto =
      model === 'claude-sonnet-4-6' ? '' : ' (precio ref. Sonnet 4.6; modelo distinto → estimación aprox.)';
    this.logger.log(
      `[costo] ${toolName} · in=${u.input} out=${u.output} cacheR=${u.cacheRead} cacheW=${u.cacheWrite} ` +
        `webSearch=${u.webSearch} → ~$${cost.toFixed(4)} USD${exacto}`,
    );
  }
}
