import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ZodSchema } from 'zod';
import { PlainErrorException } from '../../common/exceptions';
import { SYSTEM_CLINICO } from './llm/system-prompt';

const WEB_SEARCH_TOOL_TYPE = 'web_search_20250305';
const MAX_CONTINUATIONS = 4; // límite de reanudaciones por `pause_turn` (búsqueda web server-side)

interface GenerateStructuredParams<T> {
  userPrompt: string;
  tool: Anthropic.Tool;
  investigar: boolean;
  schema: ZodSchema<T>;
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
  async generateStructured<T>({ userPrompt, tool, investigar, schema }: GenerateStructuredParams<T>): Promise<T> {
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

    try {
      for (let i = 0; i <= MAX_CONTINUATIONS; i++) {
        const response = await this.client.messages.create({
          model,
          max_tokens: maxTokens,
          system: [{ type: 'text', text: SYSTEM_CLINICO, cache_control: { type: 'ephemeral' } }],
          tools,
          tool_choice: toolChoice,
          messages,
        });

        const toolUse = response.content.find(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use' && block.name === tool.name,
        );

        if (toolUse) {
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
}
