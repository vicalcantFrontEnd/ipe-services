import type {
  LeccionRequest,
  ProfundizarRequest,
  ModuloAcademicoRequest,
  SpecUxRequest,
} from '../schemas/generador.schemas';

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
    ? 'Investiga con web_search evidencia científica ESPECÍFICA y aplicable (guías clínicas con sus recomendaciones concretas, cifras de eficacia, hallazgos de meta-análisis y ensayos de APA, NICE, Cochrane), no descripciones generales. Con 2–4 búsquedas bien dirigidas basta. Integra los hallazgos con especificidad (autor, año, dato concreto) dentro del contenido y cítalos en `citas` con URL real y accesible. No inventes referencias.'
    : 'Trabaja con tu conocimiento clínico consolidado. No inventes citas ni URLs; puedes omitir `citas`.';

  return [
    'Desarrolla el contenido clínico de la siguiente lección del diplomado, con densidad informativa y profundidad de posgrado (sin relleno).',
    '',
    'Metadatos de la lección y contexto del módulo (JSON):',
    '```json',
    JSON.stringify(contexto, null, 2),
    '```',
    '',
    'Requisitos de la entrega (extensión total objetivo: ~1,800–2,500 palabras, NO excedas — densidad, no volumen):',
    '- `apertura`: encuadre breve y concreto de la lección.',
    '- `secciones`: 3–4 secciones (no más), cada una densa y con sustancia clínica aplicable (mecanismo, aplicación, indicaciones/contraindicaciones, errores frecuentes y su manejo). Evita repetir contenido entre secciones.',
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
 * Es el flujo que usa la psicóloga cuando pide ahondar en un punto del contenido
 * ya generado por el agente clínico.
 */
export function buildProfundizarPrompt(input: ProfundizarRequest): string {
  const investigar = input.investigar !== false;
  const contexto = {
    leccion: input.leccion,
    contenidoActual: input.contenido ?? null,
    ampliacionesPrevias: input.previas ?? [],
  };

  const instruccionEvidencia = investigar
    ? 'Si el punto lo requiere, investiga con web_search evidencia ESPECÍFICA y aplicable (1–3 búsquedas dirigidas) y cítala en `citas` con dato concreto (autor, año) y URL real. No inventes.'
    : 'Usa tu conocimiento clínico consolidado; no inventes citas.';

  return [
    'La psicóloga solicita profundizar o corregir un punto concreto de la lección ya generada.',
    '',
    'Solicitud:',
    `"${input.solicitud}"`,
    '',
    'Contexto (JSON) — incluye el desarrollo actual y las ampliaciones previas que NO debes repetir:',
    '```json',
    JSON.stringify(contexto, null, 2),
    '```',
    '',
    'Desarrolla ÚNICAMENTE el punto solicitado, con la profundidad suficiente para que aporte valor real: procedimiento paso a paso, criterios de decisión clínica, matices/errores frecuentes y un ejemplo concreto. Denso y aplicable, sin relleno ni generalidades. No repitas el contenido de `ampliacionesPrevias`.',
    `${instruccionEvidencia}`,
    'Respeta las salvaguardas clínicas.',
    '',
    'Al terminar, entrega el resultado llamando a la herramienta `entregar_ampliacion`.',
  ].join('\n');
}

/**
 * Agente 2 (diseñador instruccional): construye la capa académica de un módulo.
 */
export function buildModuloAcademicoPrompt(input: ModuloAcademicoRequest): string {
  const contexto = { modulo: input.modulo, lecciones: input.lecciones ?? [] };
  return [
    'Diseña la CAPA ACADÉMICA de este módulo del diplomado a partir de su contenido clínico (las lecciones ya existen).',
    '',
    'Contexto (JSON) — módulo y sus lecciones:',
    '```json',
    JSON.stringify(contexto, null, 2),
    '```',
    '',
    'Produce, con alineamiento constructivo (cada objetivo se practica en la actividad y se evalúa en al menos un reactivo):',
    '- `tituloAcademico`: nombre atractivo y académico del módulo.',
    '- `objetivos`: 1 general + 2 específicos, con verbos MEDIBLES de Bloom (no "comprender/conocer/entender").',
    '- `actividad`: una actividad 100% asincrónica que obligue a APLICAR (no describir), con caso simulado; nombre, instrucciones numeradas y entregable.',
    '- `reactivos`: 3 reactivos de opción múltiple alineados a los objetivos, con distractores plausibles y justificación; `ok` es el índice 0-based de la correcta.',
    'No inventes técnicas, autores ni cifras que no estén en el insumo. Respeta las salvaguardas (temas de riesgo en clave de formación profesional).',
    '',
    'NO emitas Markdown ni texto alrededor: entrega con la herramienta `entregar_modulo_academico`.',
  ].join('\n');
}

/**
 * Agente 3 (arquitecto UX): construye la especificación visual de un módulo.
 */
export function buildSpecUxPrompt(input: SpecUxRequest): string {
  const contexto = { modulo: input.modulo, encuadre: input.encuadre ?? null };
  return [
    'Produce la especificación de diseño UI/UX de este módulo, auditando el TONO según el tema clínico (el tema dicta la paleta).',
    '',
    'Contexto (JSON):',
    '```json',
    JSON.stringify(contexto, null, 2),
    '```',
    '',
    'Entrega:',
    '- `paleta`: regla 60-30-10 (fondo dominante 60%, marca/secundario 30%, acento/CTA 10%) con `hex`, `nombre`, `rol` y `just` (justificación psicológica ligada al tema, con contraste WCAG AA verificado — si no da el mínimo, cambia el color).',
    '- `fuentes`: par tipográfico Google Fonts (`display` para títulos y `body` para cuerpo).',
    '- `prompts`: 2 prompts en inglés, específicos (no genéricos), para las imágenes de apoyo (hero y actividad).',
    '',
    'NO emitas Markdown ni texto alrededor: entrega con la herramienta `entregar_spec_ux`.',
  ].join('\n');
}
