# Design tokens: color, contraste y tipografía

## 1. Mapa de tono clínico → dirección cromática

No copies estas paletas tal cual; úsalas como punto de partida y ajusta al módulo concreto.

| Tema | Dirección | Evitar |
|---|---|---|
| Depresión / activación conductual | Luz cálida, verdes salvia, ámbar suave; sensación de amanecer sin euforia | Grises fríos y azules oscuros dominantes |
| Ansiedad / pánico | Azules y neutros desaturados, mucho aire, ritmo predecible | Rojos saturados, alto contraste vibrante, densidad visual |
| TOC / EPR | Estructura visible, simetría, jerarquía nítida, paleta reducida | Asimetrías decorativas, texturas ruidosas |
| Trauma / PCL-5 | Sobriedad, tonos tierra apagados, control del usuario sobre lo que se despliega | Rojos, imágenes de impacto, autoplay |
| Duelo | Neutros cálidos, malvas suaves, mucho espacio | Negro dominante, tono fúnebre |
| Regulación emocional / DBT | Contrastes suaves, gradiente de intensidad como recurso visual | Alarma cromática |
| Mindfulness / MBCT | Monocromía cálida, gran espacio negativo, poco elemento | Sobrecarga de iconografía |
| Habilidades sociales / interpersonal | Pareja cromática cálida-fría en diálogo, tarjetas conversacionales | Corporativo frío y plano |

Regla general del dominio: en salud mental, la saturación baja y el contraste suficiente ganan siempre a la paleta vibrante. El contenido ya carga peso emocional; la interfaz debe restar ruido.

## 2. Regla 60-30-10

- **60 % dominante:** fondo y grandes superficies. Casi siempre un neutro claro o muy claro con temperatura definida (no `#FFFFFF` puro: produce fatiga en lectura larga; usa un off-white tipo `#FAFAF7`).
- **30 % secundario:** marca, encabezados, tarjetas, bordes, estados hover.
- **10 % acento:** CTAs y el contenedor de evaluación. Nada más. Este es el token de Von Restorff.

Añade mentalmente, aunque no los emitas como bullets nuevos: neutros de texto (primario y secundario) y colores de estado (éxito, advertencia, error) derivados de la paleta, no traídos de un framework.

## 3. Contraste WCAG

Mínimos:
- Texto normal: **4.5:1**
- Texto grande (≥ 24 px, o ≥ 19 px en bold): **3:1**
- Componentes de interfaz y bordes de foco: **3:1**
- AAA para lectura extensa: 7:1 en cuerpo. Deseable en módulos largos.

Cálculo de referencia rápido (luminancia relativa): `L = 0.2126·R + 0.7152·G + 0.0722·B` con canales linealizados; ratio = (L_claro + 0.05) / (L_oscuro + 0.05).

Pares que debes verificar antes de escribir el hex:
1. Texto de cuerpo sobre fondo dominante.
2. Texto del botón sobre color de acento.
3. Acento sobre fondo dominante (bordes, iconos).
4. Texto sobre tarjeta secundaria.

Errores típicos que fallan: ámbar o amarillo como acento con texto blanco encima; verde salvia claro sobre off-white; texto gris `#999` sobre blanco (2.8:1).

Solución cuando el acento no pasa: mantén el acento como color de relleno y pon texto oscuro encima, o usa una variante 2–3 pasos más oscura solo para el estado de texto.

## 4. Tipografía

**Pairing:** una display con carácter para títulos + una body neutra y de alta legibilidad en pantalla. Contraste estructural suficiente para que la jerarquía se lea sin tamaño.

Combinaciones sólidas en Google Fonts:
- Fraunces / Inter — editorial cálido, buen fit para módulos humanistas
- Playfair Display / Source Sans 3 — académico clásico
- Instrument Serif / DM Sans — contemporáneo, alto contraste de forma
- Libre Baskerville / Karla — lectura larga, sobrio
- Outfit / IBM Plex Sans — técnico, limpio
- Newsreader / Public Sans — institucional sin rigidez
- Bricolage Grotesque / Inter — carácter sin serif

Para módulos de temática sensible, prefiere serifs humanistas o sans de baja excentricidad. Las display geométricas extremas (condensadas, display pesadas) endurecen el tono.

**Escala tipográfica** (razón 1.25 o 1.333, declara cuál usas):
- Display / H1: 48–56 px
- H2: 32–36 px
- H3: 24–28 px
- Body: **16–18 px**, line-height 1.6
- Small / caption: 14 px, nunca menos
- Móvil: baja un paso la escala de títulos, **nunca** el cuerpo.

Medida de línea: 60–75 caracteres. Es el ajuste que más mejora la lectura de un temario denso y el que más se olvida.
