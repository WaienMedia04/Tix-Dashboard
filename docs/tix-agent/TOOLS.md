summary: "Configuración de herramientas y conexiones de TIX — Talentix | IAGIL"
read_when:
  - Al inicio de cada sesión
  - Antes de ejecutar cualquier acción de registro

# TOOLS.md - Configuración de Herramientas de TIX

---

## 🗄️ Base de Datos — Talentix (Postgres/Neon vía API REST)

TIX ya NO escribe en Google Sheets. Se conecta directo a la base de datos de
producción del dashboard Talentix (Postgres en Neon) a través de la API REST
de la app, usando ClawLink como puente HTTP.

Cada día tiene DOS registros contra la misma fila (check-in por la mañana,
check-out por la tarde) — ver más abajo.

- **API Base URL:** `https://api.talentix.com.do`
- **Empresa (empresaSlug fijo):** `iagil-bots-ia`
- **Conexión via:** ClawLink → HTTP request (REST)

> ⚠️ CRÍTICO: `empresaSlug` SIEMPRE debe ser `iagil-bots-ia` en cada registro.
> Un slug incorrecto hace que la API responda 404 y nada se guarda.

---

## 🌅 Check-in de la mañana — `POST /worklogs/checkin`

**Endpoint:** `POST https://api.talentix.com.do/worklogs/checkin`
**Headers:** `Content-Type: application/json`

```json
{
  "empresaSlug": "iagil-bots-ia",
  "talentoNombre": "Nombre exacto del talento",
  "fecha": "YYYY-MM-DD",
  "dia": "Lunes",
  "semana": 27,
  "tareasPlanificadas": "Texto completo de lo que el talento planea hacer hoy",
  "horaCheckin": "HH:MM"
}
```

| Campo | Obligatorio | Notas |
|---|---|---|
| `empresaSlug` | Sí | Siempre `"iagil-bots-ia"` |
| `talentoNombre` | Sí | Nombre exacto de la lista oficial |
| `fecha` | Sí | Formato `YYYY-MM-DD` |
| `tareasPlanificadas` | Sí | Texto tal cual lo interpretaste, sin resumir de más — es la base para calcular el cumplimiento en el check-out |
| `dia`, `semana`, `horaCheckin` | No | Opcionales |

Esta llamada crea la fila del día si no existe, o actualiza el check-in si ya
existía (por ejemplo si el talento lo reenvía corregido). No hace falta
verificar duplicados: la API usa `talentoId + fecha` como llave única.

---

## 🌇 Check-out de la tarde — `POST /worklogs/checkout`

**Endpoint:** `POST https://api.talentix.com.do/worklogs/checkout`
**Headers:** `Content-Type: application/json`
**Body:** objeto JSON (no array posicional, no rango de hoja de cálculo)

```json
{
  "empresaSlug": "iagil-bots-ia",
  "talentoNombre": "Nombre exacto del talento",
  "fecha": "YYYY-MM-DD",
  "dia": "Lunes",
  "semana": 27,
  "actividadesRealizadas": "Actividades Realizadas (interpretadas)",
  "capacitacion": "Capacitación / Estudio (interpretado)",
  "queSeEjecuto": "Qué se Ejecutó (interpretado)",
  "detallesRelevantes": "Detalles Relevantes (interpretado)",
  "informeAvances": "Informe de Avances (generado por TIX)",
  "objetivoDia": "Objetivo del Día (inferido o declarado)",
  "estadoEnvio": "✅ Enviada",
  "horaEnvio": "HH:MM",
  "puntajeIA": 9,
  "cumplimientoTareas": 90,
  "calificacionCeo": null,
  "notasTix": null
}
```

### Reglas de los campos

| Campo | Obligatorio | Notas |
|---|---|---|
| `empresaSlug` | Sí | Siempre `"iagil-bots-ia"` |
| `talentoNombre` | Sí | Nombre exacto de la lista oficial (la API lo busca sin distinguir mayúsculas, pero debe coincidir con el nombre registrado) |
| `fecha` | Sí | Formato `YYYY-MM-DD` |
| `estadoEnvio` | No (default `"✅ Enviada"` si se omite) | Usar siempre uno de los 5 estados válidos (ver abajo) |
| `puntajeIA` | No | Entero 0-10. Nunca omitir cuando `estadoEnvio` es `✅ Enviada` |
| `cumplimientoTareas` | No | Entero 0-100. Solo si hubo check-in ese día para comparar (ver SOUL.md PASO 4.5). Si no hubo check-in, omitir o enviar `null` |
| resto de campos | No | Enviar `null` u omitir si no aplica — la API los guarda como vacíos |

Esta llamada actualiza la MISMA fila que creó el check-in esa mañana (o crea
una nueva si el talento nunca hizo check-in ese día — en ese caso
`checkinEnviado` queda en `false` automáticamente).

> ⚠️ Si `empresaSlug` no existe o `talentoNombre` no coincide con ningún talento
> registrado en esa empresa, la API responde `404 Not Found` y no se crea nada.
> Esto cuenta como fallo de registro — sigue el protocolo de SOUL.md PASO 6
> (responder que se guardó pero no se pudo registrar + avisar a soporte). NO
> reintentes con un nombre distinto por tu cuenta ni preguntes en el grupo.

---

## 🔎 Consultar bitácoras — `GET /empresas/:slug/bitacoras`

Úsalo para revisar el check-in de un talento antes de calcular su
cumplimiento en el check-out, y en el cierre de las 6:00 PM (para detectar
ausentes).

- **Endpoint:** `GET https://api.talentix.com.do/empresas/iagil-bots-ia/bitacoras`
- **Header requerido:** `x-codigo-acceso: IAGIL-2026`
- **Query params útiles:** `fechaInicio`, `fechaFin` (mismo día = mismo valor en ambos), `talentoId`, `estado` (`enviada` | `no_enviada` | `permiso`), `page`, `limit`
- **Campos que devuelve por registro:** `tareasPlanificadas`, `horaCheckin`, `checkinEnviado`, `cumplimientoTareas`, además de todos los campos de check-out ya conocidos (`estadoEnvio`, `puntajeIA`, etc.)

Ejemplo para revisar el día de hoy:
```
GET /empresas/iagil-bots-ia/bitacoras?fechaInicio=2026-07-06&fechaFin=2026-07-06&limit=20
Header: x-codigo-acceso: IAGIL-2026
```

---

## 📋 Los 5 estados válidos — `estadoEnvio` (check-out)

| Estado | Cuándo usarlo |
|---|---|
| `✅ Enviada` | Bitácora recibida y completa |
| `❌ No enviada` | Ausencia sin justificación |
| `⏳ Pendiente` | Solo hubo check-in, o bitácora incompleta / fuera de horario |
| `📋 Permiso Autorizado` | Falta justificada aprobada por CEO |
| `🏥 Licencia Médica` | Ausencia por enfermedad |

---

## 💬 WhatsApp — Grupo de Bitácoras

- **Nombre del grupo:** Bitácoras de CheckOut
- **Horario de check-in:** mañana (ver hora exacta en HEARTBEAT.md)
- **Horario de check-out:** 5:00 PM (máximo 5:30 PM)
- **Idioma:** Español siempre

> Formatos de mensaje (confirmación/fallo en SOUL.md PASO 6, recordatorios en HEARTBEAT.md) — no se repiten aquí.

---

## 👥 Lista Oficial de Talentos

```
1. Charlenys Frias      → Project Manager + Setter B2B + App Gym
2. Maria Suero          → Líder Agencia GHL + Estratega IA + Oralyx
3. Eric Vizcaino        → Líder Implementador GHL + Estratega IA + Jarvis + Talentix
4. Yefferson Gonzales   → Líder Implementador GHL + Estratega IA + Repi + Talentix
5. Arnold Suarez        → Ingeniero de Soporte — Local e Internacional + Constructoras
6. Peter Chavez         → Ingeniero de Soporte — Local e Internacional + Aegis
7. Danny Solis          → Ingeniero de Soporte — Cuenta Baxter + Apps
8. Brayan Pérez         → Ingeniero de Soporte — Cuenta Baxter + Aegis
```

> Estos 8 nombres deben coincidir EXACTO con `nombreCompleto` en la tabla
> `Talento` de la base de datos (empresa `iagil-bots-ia`). Si el CEO agrega o
> cambia un talento, esto se hace desde el panel admin del dashboard — TIX no
> crea ni edita talentos por su cuenta.

---

## ⚠️ Errores críticos y soluciones

| Error | Consecuencia | Solución |
|---|---|---|
| `empresaSlug` distinto de `iagil-bots-ia` | API responde 404, nada se guarda | Usar siempre `iagil-bots-ia` |
| `talentoNombre` no coincide exacto | API responde 404 (talento no encontrado) | Copiar nombre exacto de la lista oficial |
| `estadoEnvio` vacío u omitido en el checkout | La API asume `✅ Enviada` por defecto — puede ser incorrecto | Enviarlo siempre explícito |
| `puntajeIA` vacío con estado `✅ Enviada` | Ranking del dashboard no calcula bien ese registro | Siempre número 0-10 |
| `cumplimientoTareas` inventado sin check-in real | Métrica de cumplimiento de tareas queda falsa en el dashboard | Solo calcularlo si existe `tareasPlanificadas` de ese día |
| Fecha en formato incorrecto | Filtros por fecha del dashboard no funcionan | Siempre `"YYYY-MM-DD"` |
| Llamar a un endpoint que no sea `POST /worklogs/checkin` o `/checkout` para escribir | Puede fallar o requerir autenticación admin que TIX no tiene | Solo usar esos dos endpoints para registrar |

> ❌ PROHIBIDO: TIX no debe agregar nuevas secciones, endpoints, APIs
> ni herramientas a este archivo. Solo el CEO o el administrador del
> sistema pueden modificar este archivo. Si TIX necesita recordar algo,
> lo escribe en su memory diaria, nunca aquí.

---

*TOOLS.md de TIX — Talentix | IAGIL*
*Integración confirmada en producción: API REST (Neon) vía ClawLink — check-in + check-out en la misma fila diaria*
