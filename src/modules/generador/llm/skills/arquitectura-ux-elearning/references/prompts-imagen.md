# Dirección de arte y prompts de imagen

## Anatomía del prompt

Seis componentes, en este orden:

1. **Técnica / medio** — minimalist 3D illustration, flat vector illustration, isometric diagram, paper-cut collage, soft gradient mesh abstract, line-art with grain texture.
2. **Sujeto concreto** — el concepto del módulo traducido a algo visible. No "depression"; sí "a single warm light source gradually illuminating a series of overlapping translucent layers".
3. **Composición y encuadre** — centered composition, generous negative space on the left for text overlay, low angle, flat lay.
4. **Luz y atmósfera** — soft diffused lighting, morning light, even studio light, calm atmosphere.
5. **Color explícito** — nombra los hex o describe los tonos de la paleta que definiste: "palette of warm off-white #FAFAF7, sage green #6B8E7B and amber accent #D98E4A".
6. **Uso y parámetros** — UI/UX asset, clean background, 8k, más `--ar` y `--stylize` o `--v`.

El error que arruina el resultado es saltarse el paso 2: un prompt con adjetivos de ambiente pero sin sujeto visual produce stock genérico.

## Traducir conceptos clínicos a imagen

Lo abstracto se representa con metáfora espacial, no con personas sufriendo.

| Concepto | Metáfora visual utilizable |
|---|---|
| Reestructuración cognitiva | Piezas geométricas reorganizándose en un orden nuevo; un camino que se bifurca |
| Pensamiento automático | Burbujas o hilos que emergen de un punto y se separan |
| Activación conductual | Serie de escalones ascendentes con luz creciente; brotes en secuencia |
| Exposición gradual | Escalera o gradiente que atraviesa una niebla que se aclara |
| Defusión (ACT) | Hojas flotando sobre agua en movimiento; figura observando nubes pasar |
| Valores | Brújula abstracta, constelación, horizonte con sendero |
| Mindfulness | Ondas concéntricas en agua quieta; círculo único con gran espacio |
| Regulación emocional | Ecualizador orgánico, gradiente térmico que se estabiliza |
| Formulación de caso | Nodos conectados, diagrama limpio de relaciones |

## Restricciones

- **Sin rostros hiperrealistas.** Figuras abstractas, siluetas, formas humanas estilizadas o composición sin personas. Mantiene neutralidad clínica y evita que el alumno proyecte un perfil de paciente.
- **Sin representación de sufrimiento explícito**, autolesión, sustancias, medicación, contención física ni iconografía médica invasiva. Ningún elemento que pueda funcionar como disparador.
- **Sin nombres de artistas ni de estudios vivos** ("in the style of [artista]"), sin personajes ni marcas con derechos. Describe el estilo por sus atributos formales.
- **Sin texto dentro de la imagen:** los generadores lo deforman y no es traducible ni accesible. El texto va en la capa de UI.
- Estilos como "corporate memphis" están permitidos pero agotados; prefiere una dirección con carácter propio si el módulo lo admite.
- Coherencia entre las dos imágenes: misma técnica, misma paleta, misma luz. Son de la misma página.

## Ejemplos de nivel esperado

**Débil:**
`/imagine prompt: illustration about anxiety therapy, professional, high quality --ar 16:9`

**Sólido (hero):**
`/imagine prompt: minimalist 3D illustration of translucent overlapping panes slowly aligning into a single clear path, abstract representation of cognitive restructuring, no human figures, centered composition with generous negative space on the right for text overlay, soft diffused morning light, matte clay materials, palette of warm off-white #FAFAF7, sage green #6B8E7B and muted amber #D98E4A, clean seamless background, UI/UX hero asset, 8k --ar 16:9 --stylize 150`

**Sólido (actividad):**
`/imagine prompt: flat vector illustration of an abstract stylized figure seated at a desk writing in an open notebook, simplified faceless silhouette, seven soft columns suggested on the page, calm reflective atmosphere, even lighting, subtle paper grain texture, palette of warm off-white #FAFAF7, sage green #6B8E7B and muted amber #D98E4A, generous white space, clean background, no text --ar 4:3 --v 6.0`

Nota sobre parámetros: `--ar`, `--stylize` y `--v` son de Midjourney. Si el destino es otro generador, los parámetros se ignoran sin romper el prompt; el cuerpo descriptivo es lo que hace el trabajo.
