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

// `q` se valida como string libre (el tipo del frontend es `q: string`). El
// modelo debe usar "Terapeuta"/"Consultante" (lo pide el tool y el prompt), pero
// no rechazamos la generación si varía la etiqueta: el frontend lo tolera.
export const GuionTurnoSchema = z.object({
  q: z.string(),
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
// Esquema PERMISIVO: refleja el tipo `Desarrollo` del frontend, donde todos los
// campos son opcionales. El tool + el prompt piden todos los campos (apertura,
// ≥3 secciones, guion, ejercicio, cierre), pero NO rechazamos la generación si
// el modelo omite alguno o varía una etiqueta — el frontend lo tolera y así
// evitamos el 502 "formato inesperado". Los campos de sección/cita también son
// laxos para no fallar por un `txt` faltante.
const DesarrolloSeccionOutSchema = z.object({
  t: z.string().optional(),
  txt: z.string().optional(),
});

export const DesarrolloSchema = z.object({
  apertura: z.string().optional(),
  secciones: z.array(DesarrolloSeccionOutSchema).optional(),
  guion: z.array(GuionTurnoSchema).optional(),
  comentario: z.string().optional(),
  ejercicio: z.string().optional(),
  cierre: z.string().optional(),
  nota: z.string().optional(),
  citas: z.array(CitaSchema).optional(),
});
export type Desarrollo = z.infer<typeof DesarrolloSchema>;

export const AmpliacionSchema = z.object({
  t: z.string().optional(),
  txt: z.string().optional(),
  citas: z.array(CitaSchema).optional(),
});
export type Ampliacion = z.infer<typeof AmpliacionSchema>;

// ── Metadatos de módulo (entrada para agentes académico y UX) ────────────────
const ModuloBaseSchema = z.object({
  n: z.number().optional(),
  titulo: z.string(),
  tituloAcademico: z.string().optional(),
  marco: z.string().optional(),
  horas: z.number().optional(),
});

const LeccionResumenSchema = z.object({
  id: z.string().optional(),
  titulo: z.string(),
  sintesis: z.string().optional(),
  conceptos: z.array(ConceptoSchema).optional(),
  procedimiento: z.array(z.string()).optional(),
});

// ── Agente 2: POST /modulo-academico ─────────────────────────────────────────
export const ModuloAcademicoRequestSchema = z.object({
  tipo: z.literal('modulo-academico').optional(),
  investigar: z.boolean().optional().default(false),
  modulo: ModuloBaseSchema,
  lecciones: z.array(LeccionResumenSchema).optional(),
});
export type ModuloAcademicoRequest = z.infer<typeof ModuloAcademicoRequestSchema>;

export const ModuloAcademicoSchema = z.object({
  tituloAcademico: z.string(),
  objetivos: z.object({
    general: z.string(),
    especificos: z.array(z.string()).min(1),
  }),
  actividad: z.object({
    nombre: z.string(),
    instrucciones: z.array(z.string()).min(1),
    entregable: z.string(),
  }),
  reactivos: z
    .array(
      z.object({
        q: z.string(),
        ops: z.array(z.string()).min(2),
        ok: z.number().int().min(0), // índice 0-based de la opción correcta
        just: z.string(),
      }),
    )
    .min(1),
});
export type ModuloAcademico = z.infer<typeof ModuloAcademicoSchema>;

// ── Agente 3: POST /spec-ux ──────────────────────────────────────────────────
export const SpecUxRequestSchema = z.object({
  tipo: z.literal('spec-ux').optional(),
  investigar: z.boolean().optional().default(false),
  modulo: ModuloBaseSchema,
  encuadre: z.string().optional(),
});
export type SpecUxRequest = z.infer<typeof SpecUxRequestSchema>;

export const SpecUxSchema = z.object({
  paleta: z
    .array(
      z.object({
        hex: z.string(),
        nombre: z.string(),
        rol: z.string(),
        just: z.string(),
      }),
    )
    .min(1),
  fuentes: z.object({ display: z.string(), body: z.string() }),
  prompts: z.array(z.string()).min(1),
});
export type SpecUx = z.infer<typeof SpecUxSchema>;
