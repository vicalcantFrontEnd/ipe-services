import type Anthropic from '@anthropic-ai/sdk';

/**
 * Herramientas cliente (tool_use) para forzar salida estructurada del modelo.
 * El `input_schema` es la fuente del contrato §6 del handoff.
 */

export const ENTREGAR_LECCION_TOOL: Anthropic.Tool = {
  name: 'entregar_leccion',
  description:
    'Entrega el desarrollo clínico completo de la lección. Llama a esta herramienta UNA sola vez, al terminar, con todo el contenido desarrollado.',
  input_schema: {
    type: 'object',
    properties: {
      apertura: { type: 'string', description: 'Encuadre/apertura de la lección.' },
      secciones: {
        type: 'array',
        description: 'Secciones desarrolladas del contenido (mínimo 3).',
        items: {
          type: 'object',
          properties: {
            t: { type: 'string', description: 'Título de la sección.' },
            txt: { type: 'string', description: 'Desarrollo de la sección.' },
          },
          required: ['t', 'txt'],
        },
      },
      guion: {
        type: 'array',
        description: 'Guion de una interacción terapéutica que modela la técnica.',
        items: {
          type: 'object',
          properties: {
            q: { type: 'string', enum: ['Terapeuta', 'Consultante'] },
            t: { type: 'string', description: 'Intervención de ese turno.' },
          },
          required: ['q', 't'],
        },
      },
      comentario: { type: 'string', description: 'Comentario didáctico sobre el guion.' },
      ejercicio: { type: 'string', description: 'Ejercicio de aplicación para el alumno.' },
      cierre: { type: 'string', description: 'Cierre y puente a la siguiente lección.' },
      nota: {
        type: 'string',
        description: 'Encuadre ético/de seguridad en temas sensibles (opcional).',
      },
      citas: {
        type: 'array',
        description: 'Fuentes/evidencia reales consultadas (título y URL verificables).',
        items: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            url: { type: 'string' },
            cita: { type: 'string' },
          },
          required: ['titulo', 'url'],
        },
      },
    },
    required: ['apertura', 'secciones', 'guion', 'ejercicio', 'cierre'],
  },
};

export const ENTREGAR_AMPLIACION_TOOL: Anthropic.Tool = {
  name: 'entregar_ampliacion',
  description:
    'Entrega la profundización/corrección del punto solicitado. Llama a esta herramienta UNA sola vez, al terminar.',
  input_schema: {
    type: 'object',
    properties: {
      t: { type: 'string', description: 'Título del punto profundizado.' },
      txt: {
        type: 'string',
        description: 'Desarrollo paso a paso, con criterio clínico y ejemplo.',
      },
      citas: {
        type: 'array',
        description: 'Fuentes/evidencia reales consultadas (opcional).',
        items: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            url: { type: 'string' },
            cita: { type: 'string' },
          },
          required: ['titulo', 'url'],
        },
      },
    },
    required: ['t', 'txt'],
  },
};

// ── Agente 2: diseñador instruccional ────────────────────────────────────────
export const ENTREGAR_MODULO_TOOL: Anthropic.Tool = {
  name: 'entregar_modulo_academico',
  description:
    'Entrega la capa académica del módulo (título académico, objetivos Bloom, actividad y reactivos). NO emitas Markdown ni texto: usa esta herramienta.',
  input_schema: {
    type: 'object',
    properties: {
      tituloAcademico: { type: 'string', description: 'Nombre atractivo y académico del módulo.' },
      objetivos: {
        type: 'object',
        properties: {
          general: { type: 'string', description: 'Objetivo general (verbo Bloom + contenido + condición).' },
          especificos: { type: 'array', items: { type: 'string' }, description: 'Objetivos específicos medibles.' },
        },
        required: ['general', 'especificos'],
      },
      actividad: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          instrucciones: { type: 'array', items: { type: 'string' }, description: 'Pasos numerados.' },
          entregable: { type: 'string' },
        },
        required: ['nombre', 'instrucciones', 'entregable'],
      },
      reactivos: {
        type: 'array',
        description: 'Reactivos de opción múltiple alineados a los objetivos.',
        items: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Enunciado de la pregunta.' },
            ops: { type: 'array', items: { type: 'string' }, description: 'Opciones de respuesta.' },
            ok: { type: 'integer', description: 'Índice 0-based de la opción correcta.' },
            just: { type: 'string', description: 'Justificación de la respuesta correcta.' },
          },
          required: ['q', 'ops', 'ok', 'just'],
        },
      },
    },
    required: ['tituloAcademico', 'objetivos', 'actividad', 'reactivos'],
  },
};

// ── Agente 3: arquitecto UX ──────────────────────────────────────────────────
export const ENTREGAR_UX_TOOL: Anthropic.Tool = {
  name: 'entregar_spec_ux',
  description:
    'Entrega la especificación de diseño (paleta 60-30-10, tipografías y prompts de imagen). NO emitas Markdown ni texto: usa esta herramienta.',
  input_schema: {
    type: 'object',
    properties: {
      paleta: {
        type: 'array',
        description: 'Regla 60-30-10: fondo dominante (60%), marca/secundario (30%), acento/CTA (10%).',
        items: {
          type: 'object',
          properties: {
            hex: { type: 'string', description: 'Color en formato #RRGGBB.' },
            nombre: { type: 'string' },
            rol: { type: 'string', description: 'Ej.: "Fondo Dominante (60%)".' },
            just: {
              type: 'string',
              description: 'Justificación psicológica ligada al tema clínico (con contraste AA).',
            },
          },
          required: ['hex', 'nombre', 'rol', 'just'],
        },
      },
      fuentes: {
        type: 'object',
        properties: {
          display: { type: 'string', description: 'Tipografía de títulos (Google Font).' },
          body: { type: 'string', description: 'Tipografía de cuerpo (Google Font).' },
        },
        required: ['display', 'body'],
      },
      prompts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Prompts en inglés, específicos, para generar imágenes de apoyo (hero y actividad).',
      },
    },
    required: ['paleta', 'fuentes', 'prompts'],
  },
};
