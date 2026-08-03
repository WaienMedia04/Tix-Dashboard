summary: "Skill de consultas — TIX responde preguntas sobre la plataforma Talentix (rankings, talento del mes, reportes, eventos, alertas, etc.) por chat privado con el CEO"
read_when:
  - Al inicio de cada sesión
  - Cuando alguien le hace una pregunta a TIX sobre datos de la plataforma (no un check-in/check-out) en chat privado

# CONSULTAS.md - Skill de Consultas a la Plataforma

---

## Qué es esta skill

Hasta ahora TIX solo hablaba de bitácoras, y solo en el grupo "Bitácoras de
CheckOut" (registrar check-in/check-out, ver TOOLS.md y SOUL.md). Esta skill
agrega una segunda capacidad, **separada de esa**: responder preguntas sobre
la plataforma Talentix — rankings, talento del mes, reportes, eventos,
alertas, novedades, cumpleaños, vacantes — consultando la API en vivo, en
vez de inventar o usar datos memorizados.

> ⚠️ Esta skill aplica SOLO en chat privado (SESIÓN PRINCIPAL, ver
> AGENTS.md) con el CEO u otra persona autorizada (ver "A quién le
> respondes" más abajo). El protocolo del grupo "Bitácoras de CheckOut" no
> cambia: ahí TIX sigue siendo de una sola línea, solo check-in/check-out,
> nunca preguntas ni reportes largos (ver SOUL.md PASO 6 y AGENTS.md
> "Formato en WhatsApp").

---

## A quién le respondes con esta skill

- **CEO de IAGIL** (ver USER.md): responde cualquier pregunta sobre la
  plataforma, sin restricción — es el dueño de los datos.
- **Cualquier otra persona** que escriba a TIX por privado preguntando por
  datos de la plataforma: NO uses esta skill. Responde que esa información
  solo se comparte con el CEO, y notifícale al CEO que alguien preguntó
  (mismo criterio de seguridad que AGENTS.md: "No exfiltres datos privados
  de un talento a otro ni a nadie fuera del CEO").
- Nunca reveles el valor de `x-codigo-acceso` en una respuesta a nadie, ni
  siquiera al CEO si lo pide por chat (es un secreto de configuración, no
  un dato de negocio).

---

## Cómo consultar — mecánica común a todos los endpoints de esta skill

- **API Base URL:** `https://api.talentix.com.do`
- **Empresa (slug fijo):** `iagil-bots-ia`
- **Header requerido en todos:** `x-codigo-acceso: IAGIL-2026`
- **Tool en ClawLink:** HTTP Request (GET) — igual que el resto de TIX, nunca un tool de base de datos (ver TOOLS.md).
- Todas las respuestas son JSON. Interpreta el JSON y responde en tu propio
  resumen — nunca pegues el JSON crudo en el chat.
- Si un endpoint falla (error de red, 401, 500, o campo `null` donde
  esperabas un dato): dilo con naturalidad ("no pude consultar ese dato
  ahora mismo") y ofrece reintentar — no inventes una respuesta.

---

## Catálogo de consultas

### 🏆 Talento del mes / talento destacado

**Endpoint:** `GET /empresas/iagil-bots-ia/reportes?periodo=mensual&valor=YYYY-MM`

(Si no te dan el mes, usa el mes actual: `valor` = año-mes de hoy, ej. `2026-07`.)

Respuesta relevante:
```json
{
  "resumen": {
    "empleadoDelMes": { "nombre": "Eric Vizcaino", "puntajeProm": 9.2 },
    "empleadoEnRiesgo": { "nombre": "Danny Solis", "cumplimiento": 45 }
  }
}
```
- `empleadoDelMes` = mayor puntaje IA promedio del período (basado en calidad de bitácoras, no en cumplimiento — ver MEMORY.md).
- `empleadoEnRiesgo` = menor % de cumplimiento del período — útil si preguntan "quién va peor".
- Si viene `null`, no hay datos suficientes ese período (dilo así, no inventes un nombre).

### 📆 Talento de la semana

**Endpoint:** `GET /empresas/iagil-bots-ia/reportes?periodo=personalizado&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`

Usa el rango de la semana actual: `fechaInicio` = lunes de esta semana,
`fechaFin` = hoy (o el domingo si piden "la semana pasada completa"). No
uses `periodo=semanal` — ese requiere el formato `YYYY-Www` (número de
semana ISO), más fácil de calcular mal; con fechas explícitas no hay
ambigüedad.

Misma respuesta que arriba (`resumen.empleadoDelMes` / `empleadoEnRiesgo`),
acotada a esas fechas.

### 📊 Ranking completo / top N

**Endpoint:** `GET /empresas/iagil-bots-ia/rankings?periodo=mensual&valor=YYYY-MM`

`periodo` acepta `mensual` | `anual` | `historico` (histórico = todo el
tiempo, sin `valor`). No existe `semanal` ni `personalizado` aquí — para
"esta semana" usa Reportes (arriba), no Rankings.

Respuesta relevante:
```json
{
  "general": [
    { "talentoId": "...", "nombreCompleto": "Eric Vizcaino", "rol": "...", "puntajeIAPromedio": 9.2, "bitacorasEnviadas": 20, "totalBitacoras": 22 }
  ],
  "porDepartamento": [{ "departamento": "Ventas", "talentos": [...] }]
}
```
`general` ya viene ordenado de mayor a menor puntaje — para "dame el top 3"
toma los primeros 3 de ese array.

### ⚠️ Alertas activas (riesgos y reconocimientos)

**Endpoint:** `GET /empresas/iagil-bots-ia/alertas`

Respuesta relevante:
```json
{
  "resumen": { "criticas": 2, "advertencias": 1, "positivas": 1 },
  "alertas": [
    { "nombreCompleto": "Peter Chavez", "severidad": "critica", "tipo": "inactividad", "mensaje": "3 días sin enviar una bitácora.", "fecha": "..." }
  ]
}
```
`severidad`: `critica` (rojo, requiere atención), `advertencia` (amarillo),
`positiva` (verde, reconocimiento). Úsalo para "¿hay algo urgente?" o
"¿cómo está el equipo hoy?".

### 🧠 Reporte ejecutivo con análisis de IA

**Endpoint:** `GET /empresas/iagil-bots-ia/reportes-ejecutivos?periodo=mensual&valor=YYYY-MM`

Igual que Reportes, pero además trae `analisis` (generado por IA, tarda más
y tiene costo — úsalo solo cuando el CEO pida explícitamente un "análisis"
o "resumen ejecutivo con recomendaciones", NO para preguntas simples de un
solo dato como "quién es el mejor" — para eso usa Reportes normal, es
gratis e instantáneo):
```json
{
  "analisis": {
    "resumenEjecutivo": "...",
    "fortalezas": ["..."],
    "riesgos": ["..."],
    "recomendaciones": ["..."]
  }
}
```
Si `analisis` viene `null`, la IA no pudo generar el análisis ese momento —
dile al CEO los números crudos igual (resumen/detalle siguen viniendo) y
que el análisis narrativo no estuvo disponible.

### 🎂 Cumpleaños

**Endpoint:** `GET /empresas/iagil-bots-ia/cumpleanos`

Respuesta: `{ "hoy": [...], "esteMes": [...], "porMes": [{ "mes": 1, "talentos": [...] }] }`. Cada persona trae `nombreCompleto`, `departamento`, `dia` (solo en `esteMes`/`porMes`).

### 📰 Noticias y eventos (mural informativo)

**Endpoint:** `GET /empresas/iagil-bots-ia/boletin?tipo=NOTICIA` (o `EVENTO`, `BLOG` — omite `tipo` para traer todo)

Respuesta: `{ "data": [{ "tipo", "titulo", "contenido", "fechaEvento", "createdAt", "autorNombre" }], "hayMas": false }`.

### 🌟 Novedades del equipo (logros, buenas acciones, situaciones)

**Endpoint:** `GET /empresas/iagil-bots-ia/novedades`

Array de `{ "nombreCompleto", "tipo", "fecha", "descripcion", "creadoPorNombre" }`. `tipo` puede ser LOGRO, EXITO, BUENA_ACCION, COSA_BUENA, TARDANZA, AUSENCIA, PERMISO, NO_CUMPLIMIENTO, ERROR, SITUACION, EVENTO o NOTA — filtra con `?tipo=LOGRO` si preguntan específicamente por logros, por ejemplo.

### 💼 Vacantes abiertas

**Endpoint:** `GET /empresas/iagil-bots-ia/vacantes`

Array de `{ "titulo", "descripcion", "departamento", "estado", "autorNombre" }`. `estado` es `ABIERTA` o `CERRADA` — filtra vos mismo en la respuesta (el endpoint no filtra por query param), solo mencionando las `ABIERTA` si preguntan "qué vacantes hay abiertas".

### 📋 Bitácoras / roster de empleados

Ya documentados en TOOLS.md ("Consultar bitácoras" y "Lista de Talentos") —
son los mismos endpoints, úsalos igual para preguntas privadas del CEO
sobre un talento puntual (ej. "qué envió Eric hoy").

---

## Ejemplos de preguntas → endpoint

| Pregunta del CEO | Endpoint a usar |
|---|---|
| "¿Quién es el talento del mes?" | `/reportes?periodo=mensual` |
| "¿Cómo vamos esta semana?" | `/reportes?periodo=personalizado&fechaInicio=...&fechaFin=...` |
| "Dame el top 5 del mes" | `/rankings?periodo=mensual` |
| "¿Hay algo urgente hoy?" | `/alertas` |
| "Hazme un análisis del mes con recomendaciones" | `/reportes-ejecutivos?periodo=mensual` |
| "¿Quién cumple años esta semana/mes?" | `/cumpleanos` |
| "¿Qué publicamos en el mural últimamente?" | `/boletin` |
| "¿Qué logros hubo esta semana?" | `/novedades?tipo=LOGRO` |
| "¿Qué vacantes tenemos abiertas?" | `/vacantes` |
| "¿Qué envió Eric hoy?" | `/bitacoras?talentoId=...` (ver TOOLS.md) |

---

## Formato de respuesta

Mismas reglas de AGENTS.md ("Formato en WhatsApp": sin tablas markdown ni
encabezados, **negrita**/MAYÚSCULAS y listas con viñetas) y el estilo que
le gusta al CEO (ver USER.md "Cómo Reportarle" y su ejemplo de reporte):
directo, con números y nombres concretos, sin relleno. A diferencia del
grupo de bitácoras, aquí SÍ puedes dar respuestas de varias líneas si la
pregunta lo amerita (un ranking, un análisis) — pero sigue siendo un chat,
no un documento.

---

*CONSULTAS.md de TIX — Talentix | IAGIL*
*Skill de solo lectura — no registra ni modifica nada, solo consulta la API y responde.*
