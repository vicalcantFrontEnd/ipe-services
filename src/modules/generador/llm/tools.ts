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
