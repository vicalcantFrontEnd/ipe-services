# Handoff Backend → Frontend — Generador de Diplomados

> Documento de entrega del **backend** (`ipe-services`, NestJS) para el equipo de **frontend**
> (`/generador-diplomados`). Describe **todo** lo implementado del lado del servidor: la integración
> con el LLM, las 4 APIs, sus contratos exactos y la lógica de negocio. Al final hay una sección de
> **análisis** con lo que el frontend debe revisar, cambiar o implementar.
>
> Estado: **backend completo y desplegable**. Los 3 agentes están cableados. La imagen se despliega
> por GitHub Actions (push a `main`) al VPS.

---

## 1. Resumen de lo que se construyó

Se implementó el módulo `generador` en el backend, **independiente** del CRUD `diplomados`. Encadena
los **3 agentes** del pipeline, cada uno respaldado por su **skill de Claude** (copiada al repo del
backend e inyectada como *system prompt*):

| Agente | Skill | Endpoint(s) | Rol |
|---|---|---|---|
| **1. Especialista clínico** | `apoyo-psicologico-tcc` | `POST /api/generador/leccion`, `POST /api/generador/profundizar` | Desarrolla el contenido clínico de cada lección con base en evidencia; profundiza puntos a petición. |
| **2. Diseñador instruccional** | `diseno-instruccional-diplomados` | `POST /api/generador/modulo-academico` | Convierte el contenido en módulo académico (Bloom, actividad, reactivos). |
| **3. Arquitecto UX** | `arquitectura-ux-elearning` | `POST /api/generador/spec-ux` | Produce design tokens (paleta 60-30-10), tipografías y prompts de arte. |

**Diferencia con el handoff original:** en la primera iteración solo se pedían los endpoints del
agente clínico (`leccion`, `profundizar`). **Ahora los 3 agentes están implementados** en el backend.
El frontend hoy solo invoca `leccion` y `profundizar`; `modulo-academico` y `spec-ux` quedan listos
para consumirse cuando el frontend deje de resolverlos en cliente.

---

## 2. Cómo conectar

- El backend expone `https://api.institutodepsicologiayeducacion.com` (VPS, detrás de Nginx con SSL).
- El frontend arma la URL como `${VITE_API_BASE_URL}${path}`. Configurar en el frontend (Vercel):
  ```bash
  VITE_API_BASE_URL=https://api.institutodepsicologiayeducacion.com   # raíz, SIN /api al final
  VITE_GENERADOR_MOCK=false
  ```
  Con `VITE_API_BASE_URL` vacío o `VITE_GENERADOR_MOCK=true`, el frontend sigue en modo mock/demo.
- **CORS:** ya está habilitado el origen del panel (`admin-panel.institutodepsicologiayeducacion.com`)
  y el sitio principal. Si el generador se sirve desde otro dominio, avisar para agregarlo a `CORS_ORIGINS`.
- **Los endpoints son públicos** (no requieren JWT), tal como asume el frontend. Están protegidos con
  **rate limiting** por el costo del LLM (ver §6).

---

## 3. Convenciones generales (importante)

- Todos los endpoints son **`POST`** con `Content-Type: application/json`.
- **Éxito:** `200` con el **JSON crudo del recurso** (sin envelope). Es decir, el cuerpo es
  directamente el objeto `Desarrollo` / `Ampliación` / etc. — **no** viene envuelto en `{ success, data }`.
- **Error:** código HTTP ≠ 2xx **y** cuerpo exactamente `{ "error": "<mensaje legible en español>" }`.
  El frontend ya lo lee así (`j.error`). Ejemplos de status: `400` (validación), `502` (el modelo falló
  o devolvió formato inesperado), `503` (falta configurar la API key), `408`/`504` (timeout), `429`
  (rate limit).
- **Timeouts (crítico):** una generación con búsqueda web tarda **~2–3 minutos** (medido: 2m46s).
  El backend permite hasta **5 minutos** (Nginx `proxy_read_timeout 300s` + timeout de app 300s).
  El frontend debe:
  - Mantener un estado de "pensando"/cargando durante ese tiempo.
  - **No** abortar el `fetch` antes de ~300s (si usan `AbortController` con timeout, ponerlo ≥ 300s).
  - Considerar que sin búsqueda web (`investigar:false`) es mucho más rápido (~15–40s).

---

## 4. Contrato de endpoints

Los tipos de salida **coinciden con `src/pages/generador-diplomados/data/types.ts`** del frontend.

### 4.1 `POST /api/generador/leccion` — Desarrollo clínico ✅ (ya invocado)

**Request** (igual a `GenerarLeccionInput` del frontend):
```jsonc
{
  "tipo": "leccion",                 // opcional
  "investigar": true,                // opcional, default true → web search + citas reales
  "leccion": {
    "id": "1.1",
    "titulo": "El modelo cognitivo",
    "marco": "TCC clásica",
    "sintesis": "…",                 // opcional
    "conceptos": [{ "t": "…", "d": "…" }],   // opcional
    "procedimiento": ["paso 1", "…"],        // opcional
    "vineta": { "situacion": "…", "trabajo": "…" }, // opcional
    "errores": ["…"],                // opcional
    "salvaguarda": "…"               // opcional (temas sensibles)
  },
  "modulo": {                        // opcional
    "n": 1, "titulo": "Fundamentos", "tituloAcademico": "…",
    "marco": "…", "objetivos": { "general": "…", "especificos": ["…"] }
  }
}
```

**Response 200** — objeto `Desarrollo`:
```jsonc
{
  "apertura": "…",
  "secciones": [{ "t": "…", "txt": "…" }],            // ≥ 3
  "guion": [{ "q": "Terapeuta" | "Consultante", "t": "…" }],
  "comentario": "…",                                  // opcional
  "ejercicio": "…",
  "cierre": "…",
  "nota": "…",                                        // opcional (encuadre en temas sensibles)
  "citas": [{ "titulo": "…", "url": "https://…", "cita": "…" }]  // cuando investigar !== false
}
```

### 4.2 `POST /api/generador/profundizar` — Profundizar/corregir ✅ (ya invocado)

**Request** (igual a `ProfundizarInput`):
```jsonc
{
  "tipo": "profundizacion",          // opcional
  "investigar": true,                // opcional, default true
  "leccion": { "id": "1.1", "titulo": "El modelo cognitivo", "marco": "TCC clásica" },
  "contenido": { /* Desarrollo actual, para contexto */ },
  "solicitud": "Falta el manejo cuando la persona no reporta ningún pensamiento.",
  "previas": [{ "t": "Título ampliación previa", "txt": "…" }]   // no se repiten
}
```

**Response 200** — igual a `ProfundizacionResult`:
```jsonc
{ "t": "…", "txt": "…", "citas": [{ "titulo": "…", "url": "https://…", "cita": "…" }] }
```

### 4.3 `POST /api/generador/modulo-academico` — Capa académica 🆕 (listo, aún no invocado)

Genera los campos **académicos** del `Modulo` (los define el agente 2). Las **lecciones** del módulo
las sigue aportando el agente clínico; este endpoint **no** las devuelve.

**Request:**
```jsonc
{
  "tipo": "modulo-academico",        // opcional
  "investigar": false,               // opcional, default FALSE (no requiere web search)
  "modulo": { "n": 1, "titulo": "Fundamentos de TCC", "marco": "TCC clásica",
              "tituloAcademico": "…", "horas": 8 },   // solo titulo es obligatorio
  "lecciones": [                     // opcional pero recomendado (da el contenido a partir del cual diseñar)
    { "id": "1.1", "titulo": "El modelo cognitivo", "sintesis": "Modelo A-B-C de Beck",
      "conceptos": [{ "t": "…", "d": "…" }], "procedimiento": ["…"] }
  ]
}
```

**Response 200** (subconjunto académico de `Modulo`):
```jsonc
{
  "tituloAcademico": "Fundamentos Clínicos de la TCC",
  "objetivos": { "general": "…", "especificos": ["…", "…"] },   // verbos Bloom medibles
  "actividad": { "nombre": "…", "instrucciones": ["1. …", "2. …"], "entregable": "…" },
  "reactivos": [
    { "q": "…", "ops": ["A", "B", "C", "D"], "ok": 2, "just": "…" }   // ok = índice 0-based de la correcta
  ]
}
```

### 4.4 `POST /api/generador/spec-ux` — Especificación de diseño 🆕 (listo, aún no invocado)

Genera el objeto `UX` del `Modulo` (agente 3).

**Request:**
```jsonc
{
  "tipo": "spec-ux",                 // opcional
  "investigar": false,               // opcional, default FALSE
  "modulo": { "n": 1, "titulo": "Fundamentos de TCC",
              "tituloAcademico": "Fundamentos Clínicos de la TCC", "marco": "TCC clásica" },
  "encuadre": "…"                    // opcional (contexto/tono del diplomado)
}
```

**Response 200** (igual a `UX`):
```jsonc
{
  "paleta": [   // regla 60-30-10
    { "hex": "#F4F1EA", "nombre": "…", "rol": "Fondo Dominante (60%)", "just": "…" },
    { "hex": "#…",       "nombre": "…", "rol": "Marca/Secundario (30%)", "just": "…" },
    { "hex": "#…",       "nombre": "…", "rol": "Acento/CTA (10%)", "just": "…" }
  ],
  "fuentes": { "display": "Fraunces", "body": "Inter" },   // Google Fonts
  "prompts": ["<prompt en inglés para la imagen hero>", "<prompt para la actividad>"]
}
```

> Nota: el skill de UX también produce internamente un **wireframe** de 4 bloques, pero el tipo `UX`
> del frontend hoy **no** tiene ese campo, así que el endpoint devuelve solo `paleta`/`fuentes`/`prompts`.
> Si el frontend quiere el wireframe, avisar y se agrega el campo al contrato.

---

## 5. Integración con el LLM (Claude / Anthropic)

- **Modelo:** `claude-sonnet-4-6` (configurable por env `ANTHROPIC_MODEL`).
- **API key:** vive **solo en el servidor** (`ANTHROPIC_API_KEY`, en el `.env` del VPS). Nunca se expone
  al navegador. Requiere **crédito de API** (el plan MAX no cubre la API).
- **Salida estructurada:** cada agente usa una *tool* con `input_schema`; el backend lee el bloque
  `tool_use` y valida con **zod** antes de responder. Si el modelo no devuelve la tool esperada →
  `502 { error: "El modelo no devolvió contenido estructurado." }`.
- **Búsqueda web / evidencia (`investigar`):**
  - `investigar: true` → habilita `web_search` (máx. 3 búsquedas, configurable). El agente clínico
    trae **citas reales** (título + URL verificable), no inventadas.
  - `investigar: false` → sin web search; más rápido y ~30–50% más barato. Puede omitir `citas`.
  - Agentes 2 y 3 usan `investigar:false` por defecto (no lo necesitan).
- **Prompt caching:** el system prompt (skill completo) se cachea; al generar muchas lecciones seguidas
  se relee a ~0.1× → ahorra en el diploma completo.
- **Salvaguardas clínicas (siempre activas):** sin métodos/letalidad, sin cifras en conducta alimentaria,
  sin opiniones farmacológicas (deriva a psiquiatría), diagnósticos como hipótesis, temas de riesgo en
  clave de **formación profesional**, casos **simulados**, no inventar citas/URLs.

---

## 6. Lógica de negocio del backend

- **Respuesta cruda + errores `{ error }`:** decorador `@RawResponse()` (sin envelope) y
  `PlainErrorException` (cuerpo `{ error }`). Alineado con lo que el frontend ya espera.
- **Validación:** zod tanto en el **body de entrada** como en la **salida del modelo**.
- **Densidad de contenido:** el prompt pide contenido **denso y específico** (mecanismos, criterios,
  cifras, ejemplos), sin relleno, con profundidad de posgrado (~1,800–2,500 palabras/lección). La
  investigación busca evidencia **específica** (autor, año, dato), no descripciones generales.
- **Rate limiting** (por el costo del LLM):
  - `leccion`: 10 req/min · `profundizar`: 20 req/min · `modulo-academico` y `spec-ux`: 15 req/min.
  - Al excederse: `429`.
- **Timeouts:** 5 min por request (backend + Nginx).
- **Log de costo por llamada** (solo en servidor): cada generación registra
  `[costo] <tool> · in=… out=… webSearch=… → ~$X USD`. Referencia de costo por lección con web search:
  **~$0.30–0.90** y ~2–3 min.
- **Configuración por env (servidor):** `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `ANTHROPIC_MAX_TOKENS`
  (default 16000 en prod), `ANTHROPIC_WEB_SEARCH_MAX_USES` (default 3), `ANTHROPIC_WORKSPACE_ID` (opcional).

---

## 7. Qué debe REVISAR / DECIDIR el frontend

> Esta es la sección de análisis pedida. Nada aquí es urgente si solo se usa hoy `leccion`/`profundizar`,
> pero conviene revisarlo.

1. **Contratos ya alineados (no cambian):** `leccion` y `profundizar` coinciden con lo que el frontend
   ya envía (`GenerarLeccionInput`, `ProfundizarInput`) y espera (`Desarrollo`, `ProfundizacionResult`).
   **Verificar** que se sigan enviando los campos tal cual (el backend ignora campos extra y valida los
   requeridos: en `profundizar`, `solicitud` es obligatorio y no puede ir vacío).

2. **UX de espera (lo más importante):** con `investigar:true` la respuesta tarda **2–3 min**. Confirmar
   que:
   - El estado "pensando" aguanta ese tiempo sin timeout del cliente.
   - No hay `AbortController`/timeout de fetch < 300s.
   - Si hay algún proxy propio (Vercel rewrite, etc.), su timeout sea ≥ 300s. (Si llaman directo al
     backend, no aplica.)

3. **Costo → estrategia de `investigar`:** cada lección con web search cuesta ~$0.30–0.90. Recomendación
   de producto: usar `investigar:false` por defecto y activar `investigar:true` solo cuando la psicóloga
   quiera citas frescas. Evaluar exponer un toggle "investigar con evidencia" en la UI.

4. **Endpoints nuevos (2 y 3):** hoy el frontend resuelve `modulo-academico` y `spec-ux` en cliente de
   forma determinista. Si se quiere el contenido **real generado por IA**, hay que **añadir 2 funciones**
   en `lib/api.ts` (mismo patrón `post<T>()`) apuntando a `/api/generador/modulo-academico` y
   `/api/generador/spec-ux`. El contrato de salida ya calca los tipos `Modulo` (académico) y `UX`, así que
   **no** hay que cambiar tipos, solo mapear la respuesta a `Modulo.objetivos/actividad/reactivos/tituloAcademico`
   y `Modulo.ux`.

5. **Wireframe UX:** el tipo `UX` no incluye wireframe y el endpoint no lo devuelve. Decidir si se quiere
   (se puede agregar al contrato) o se sigue maquetando en cliente.

6. **Reactivos (`ok`):** recordar que `ok` es el **índice 0-based** de la opción correcta dentro de `ops`
   (ya es así en el tipo `Reactivo`).

7. **Manejo de errores:** el toast ya lee `{ error }`. Verificar que se muestre para todos los status
   (incluye `503` si el servidor aún no tiene la API key, y `429` si se supera el rate limit).

---

## 8. Variables de entorno del frontend

```bash
VITE_API_BASE_URL=https://api.institutodepsicologiayeducacion.com   # raíz, sin /api
VITE_GENERADOR_MOCK=false
```

---

## 9. Checklist de aceptación (para validar la integración real)

- [ ] `VITE_API_BASE_URL` apuntando al backend → el frontend sale del modo demo (`isMock === false`).
- [ ] `POST /leccion` con `investigar:false` responde en ~15–40s con `Desarrollo` completo (termina en `cierre`).
- [ ] `POST /leccion` con `investigar:true` responde en ~2–3 min con `citas` reales; el "pensando" no se corta.
- [ ] `POST /profundizar` responde a `solicitud` y no repite `previas`.
- [ ] Errores muestran el toast con `{ error }` (probar, p. ej., `solicitud` vacío → 400).
- [ ] (Si se conectan) `POST /modulo-academico` devuelve objetivos Bloom + actividad + 3 reactivos.
- [ ] (Si se conectan) `POST /spec-ux` devuelve paleta 60-30-10 + fuentes + prompts de imagen.

---

## Apéndice — Rutas y estado

| Método | Ruta | Agente | Estado |
|---|---|---|---|
| POST | `/api/generador/leccion` | 1 clínico | ✅ En uso |
| POST | `/api/generador/profundizar` | 1 clínico | ✅ En uso |
| POST | `/api/generador/modulo-academico` | 2 instruccional | 🆕 Listo (conectar en `lib/api.ts`) |
| POST | `/api/generador/spec-ux` | 3 UX | 🆕 Listo (conectar en `lib/api.ts`) |

Roadmap no implementado aún (no lo pide el frontend hoy): `POST /documento` (parseo de PDF del temario)
y `POST /exportar` (`.pptx` / `.md`). Si se necesitan, avisar para especificar el contrato.
