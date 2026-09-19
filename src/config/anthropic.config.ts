import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const anthropicConfigSchema = z.object({
  // Opcional al arrancar para no bloquear el resto de la API si aún no está la
  // key. El módulo Generador falla con mensaje claro cuando falta (ver AnthropicService).
  ANTHROPIC_API_KEY: z.string().optional(),
  // Solo necesario si la API key es de nivel organización (no scoped a un
  // workspace). Se envía como header `anthropic-workspace-id`.
  ANTHROPIC_WORKSPACE_ID: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-6'),
  // Máximo de tokens de salida por generación (una lección larga cabe holgada en 8000).
  ANTHROPIC_MAX_TOKENS: z.coerce.number().int().positive().default(8000),
  // Nº máximo de búsquedas web por generación cuando `investigar` está activo.
  // 3 = suficiente para evidencia específica sin disparar el costo.
  ANTHROPIC_WEB_SEARCH_MAX_USES: z.coerce.number().int().positive().default(3),
});

export type AnthropicConfig = z.infer<typeof anthropicConfigSchema>;

export default registerAs('anthropic', (): AnthropicConfig => {
  const config = anthropicConfigSchema.parse(process.env);
  return config;
});
