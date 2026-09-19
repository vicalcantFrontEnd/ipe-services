import { z } from 'zod';

/**
 * Fuente de verdad de los tipos: `src/pages/generador-diplomados/data/types.ts`
 * del frontend. Estos esquemas validan tanto el cuerpo de entrada de la API como
 * la salida estructurada (tool_use) que devuelve el modelo.
 */

// ── Sub-tipos compartidos ────────────────────────────────────────────────────
export const ConceptoSchema = z.object({
  t: z.string(),
  d: z.string(),
});

export const VinetaSchema = z.object({
  situacion: z.string(),
  trabajo: z.string(),
});

export const CitaSchema = z.object({
  titulo: z.string(),
  url: z.string(),
  cita: z.string().optional(),
});

export const DesarrolloSeccionSchema = z.object({
  t: z.string(),
  txt: z.string(),
});

export const GuionTurnoSchema = z.object({
  q: z.enum(['Terapeuta', 'Consultante']),
  t: z.string(),
});

// ── Metadatos de la lección / módulo (entrada) ───────────────────────────────
export const LeccionMetaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  marco: z.string().optional(),
  sintesis: z.string().optional(),
  conceptos: z.array(ConceptoSchema).optional(),
  procedimiento: z.array(z.string()).optional(),
  vineta: VinetaSchema.optional(),
  errores: z.array(z.string()).optional(),
  salvaguarda: z.string().optional(),
});

export const ModuloMetaSchema = z.object({
  n: z.number().optional(),
  titulo: z.string().optional(),
  tituloAcademico: z.string().optional(),
  marco: z.string().optional(),
  objetivos: z
    .object({
      general: z.string().optional(),
      especificos: z.array(z.string()).optional(),
    })
    .optional(),
});

// ── POST /leccion — entrada ──────────────────────────────────────────────────
export const LeccionRequestSchema = z.object({
  tipo: z.literal('leccion').optional(),
  investigar: z.boolean().optional().default(true),
  leccion: LeccionMetaSchema,
  modulo: ModuloMetaSchema.optional(),
});
export type LeccionRequest = z.infer<typeof LeccionRequestSchema>;

// ── POST /profundizar — entrada ──────────────────────────────────────────────
export const ProfundizarRequestSchema = z.object({
  tipo: z.literal('profundizacion').optional(),
  investigar: z.boolean().optional().default(true),
  leccion: LeccionMetaSchema,
  contenido: z.record(z.unknown()).optional(),
  solicitud: z.string().min(1, 'La solicitud no puede estar vacía.'),
  previas: z.array(z.object({ t: z.string(), txt: z.string() })).optional(),
});
export type ProfundizarRequest = z.infer<typeof ProfundizarRequestSchema>;

// ── Salida del agente clínico (tool_use) ─────────────────────────────────────
export const DesarrolloSchema = z.object({
  apertura: z.string(),
  secciones: z.array(DesarrolloSeccionSchema).min(1),
  guion: z.array(GuionTurnoSchema),
  comentario: z.string().optional(),
  ejercicio: z.string(),
  cierre: z.string(),
  nota: z.string().optional(),
  citas: z.array(CitaSchema).optional(),
});
export type Desarrollo = z.infer<typeof DesarrolloSchema>;

export const AmpliacionSchema = z.object({
  t: z.string(),
  txt: z.string(),
  citas: z.array(CitaSchema).optional(),
});
export type Ampliacion = z.infer<typeof AmpliacionSchema>;
