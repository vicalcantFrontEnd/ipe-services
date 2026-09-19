# Bloques de interfaz, grilla y comportamiento

## Grilla y espaciado

- 12 columnas, gutter 24 px, ancho máximo de contenedor 1200–1280 px.
- Contenido de lectura: 6–8 columnas centradas (nunca los 12, salvo en hero o galerías).
- Escala de espaciado base 8: 8 / 16 / 24 / 32 / 48 / 64 / 96. Entre bloques, 64–96 px en escritorio; 40–56 px en móvil.
- Breakpoints: móvil < 640, tablet 640–1024, escritorio > 1024. Declara qué colapsa en cada bloque.

El espacio negativo es el recurso más barato para bajar carga cognitiva en contenido académico denso. Cuando dudes, quita un elemento antes de apretar el margen.

## Bloque 1 — Hero

*Layout:* dos columnas 7/5 en escritorio (texto izquierda, ilustración derecha), apilado en móvil con la imagen debajo del CTA para que la acción quede sobre el pliegue.
*Contenido UI:* eyebrow con el nombre del diplomado, H1 con el título del módulo, chip de duración ("8 horas de trabajo autónomo"), botón primario "Iniciar módulo" en color de acento, botón fantasma secundario "Ver temario" con scroll ancla.
Variante sobria para temas sensibles: hero de una columna, centrado, sin ilustración dominante.

## Bloque 2 — Objetivos de aprendizaje

*Layout:* objetivo general en banner ancho (8 columnas, fondo secundario suave, borde izquierdo de acento); objetivos específicos en grilla de 2 columnas tipo card, apiladas en móvil.
*Contenido UI:* icono lineal por tarjeta (nunca emoji), etiqueta del nivel Bloom si viene en el insumo, sombra suave o borde de 1 px — una de las dos, no ambas.

## Bloque 3 — Temario y desarrollo

*Layout:* acordeones verticales, uno por lección, con la primera abierta por defecto y las demás colapsadas. Indicador de progreso lateral o superior.
*Contenido UI:* numeración visible (2.1, 2.2, 2.3), título de lección en H3, resumen de contenido en cuerpo con medida de línea controlada, chip de tiempo estimado por lección. Cabecera del acordeón con área clicable completa y estado abierto/cerrado señalado por icono **y** por cambio de fondo.

Alternativa para módulos de muchas lecciones: navegación por pasos (stepper) con contenido a la derecha.

## Bloque 4 — Actividad y evaluación

*Layout:* contenedor destacado con borde de 2 px en color de acento, fondo ligeramente diferenciado del dominante y padding generoso (48 px escritorio / 24 px móvil). Evaluación como sub-bloque separado por divisor.
*Contenido UI:* nombre de la tarea en H3, instrucciones como lista numerada con espaciado 16 px entre pasos, callout de entregable (icono + formato exacto), CTA "Subir entregable". Reactivos como tarjetas de pregunta con opciones tipo radio de área clicable completa; retroalimentación (respuesta correcta y justificación) colapsada por defecto, desplegable tras responder.

## Estados y detalles que se olvidan

- Foco de teclado visible en todo elemento interactivo, contraste ≥ 3:1.
- Hover, activo, deshabilitado y cargando definidos para el botón primario.
- Estado vacío y estado de error del componente de subida.
- Semántica: un H1 por página, jerarquía sin saltos, acordeones con `aria-expanded`.
- Modo oscuro opcional: si lo declaras, invierte luminancia, no hues, y vuelve a verificar contraste.
- Sin autoplay de video ni animación de entrada agresiva: en módulos de ansiedad o trauma el movimiento no consentido es coste, no encanto. Respeta `prefers-reduced-motion`.
