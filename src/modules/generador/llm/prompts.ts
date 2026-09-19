import type { LeccionRequest, ProfundizarRequest } from '../schemas/generador.schemas';

/**
 * Construye el prompt de usuario para generar el desarrollo clínico de una lección.
 */
export function buildLeccionPrompt(input: LeccionRequest): string {
  const investigar = input.investigar !== false;
  const contexto = {
    leccion: input.leccion,
    modulo: input.modulo ?? null,
  };

  const instruccionEvidencia = investigar
    ? 'Investiga con la herramienta web_search evidencia científica actual (APA, NICE, Cochrane, meta-análisis, ensayos) y cita las fuentes REALES y accesibles en `citas` (título y URL). No inventes referencias.'
    : 'Trabaja con tu conocimiento clínico consolidado. No inventes citas ni URLs; puedes omitir `citas`.';

  return [
    'Desarrolla el contenido clínico completo de la siguiente lección del diplomado.',
    '',
    'Metadatos de la lección y contexto del módulo (JSON):',
    '```json',
    JSON.stringify(contexto, null, 2),
    '```',
    '',
    'Requisitos de la entrega:',
    '- `apertura`: encuadre de la lección.',
    '- `secciones`: al menos 3 secciones desarrolladas (mecanismo, aplicación, indicaciones/contraindicaciones, errores frecuentes y su manejo).',
    "- `guion`: interacción terapéutica que modela la técnica; `q` es 'Terapeuta' o 'Consultante'.",
    '- `ejercicio`: ejercicio de aplicación para el alumno (caso simulado).',
    '- `cierre`: síntesis y puente a la siguiente lección.',
    '- Respeta SIEMPRE las salvaguardas clínicas; usa `nota` para el encuadre en temas sensibles.',
    `- ${instruccionEvidencia}`,
    '',
    'Al terminar, entrega el resultado llamando a la herramienta `entregar_leccion`.',
  ].join('\n');
}

/**
 * Construye el prompt de usuario para profundizar/corregir un punto de una lección.
 */
export function buildProfundizarPrompt(input: ProfundizarRequest): string {
  const investigar = input.investigar !== false;
  const contexto = {
    leccion: input.leccion,
    contenidoActual: input.contenido ?? null,
    ampliacionesPrevias: input.previas ?? [],
  };

  const instruccionEvidencia = investigar
    ? 'Si aporta, investiga con web_search y cita fuentes REALES en `citas` (no inventes).'
    : 'Usa tu conocimiento clínico consolidado; no inventes citas.';

  return [
    'La psicóloga solicita profundizar o corregir un punto concreto de la lección.',
    '',
    'Solicitud:',
    `"${input.solicitud}"`,
    '',
    'Contexto (JSON) — incluye el desarrollo actual y las ampliaciones previas que NO debes repetir:',
    '```json',
    JSON.stringify(contexto, null, 2),
    '```',
    '',
    'Desarrolla ÚNICAMENTE el punto solicitado, con procedimiento paso a paso, criterio clínico y un ejemplo. No repitas el contenido de `ampliacionesPrevias`.',
    `${instruccionEvidencia}`,
    'Respeta las salvaguardas clínicas.',
    '',
    'Al terminar, entrega el resultado llamando a la herramienta `entregar_ampliacion`.',
  ].join('\n');
}
