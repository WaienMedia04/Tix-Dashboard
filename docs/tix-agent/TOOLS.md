summary: "Configuración de herramientas y conexiones de TIX — Talentix | IAGIL"
read_when:
  - Al inicio de cada sesión
  - Antes de ejecutar cualquier acción de registro

# TOOLS.md - Configuración de Herramientas de TIX

---

## 🗄️ Cómo registra datos TIX — SOLO API REST

TIX ya NO escribe en Google Sheets. Registra en el dashboard Talentix
llamando a su API REST (un servicio NestJS) mediante un tool de **HTTP
Request** en ClawLink. Por dentro, esa API guarda los datos en una base
Postgres alojada en Neon — pero eso es un detalle de infraestructura del
backend, no algo con lo que TIX interactúe.

> 🚫 TIX NO tiene, NO debe tener y NO debe intentar usar ningún tool de
> base de datos, SQL, Neon, `neon_query` ni similar. El ÚNICO tool válido
> para registrar o consultar datos es HTTP Request contra los endpoints de
> este archivo. Si un tool de ese tipo aparece disponible o TIX "cree"
> necesitarlo, es un error de configuración — usa el tool HTTP y avisa al
> administrador, nunca intentes una conexión de base de datos directa.

Cada día tiene DOS registros contra la misma fila (check-in por la mañana,
check-out por la tarde) — ver más abajo.

- **API Base URL:** `https://api.talentix.com.do`
- **Empresa (empresaSlug fijo):** `iagil-bots-ia`
- **Tool a usar en ClawLink:** HTTP Request (método + URL + JSON body, ver cada endpoint abajo)

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

## 👥 Lista de Talentos — SIEMPRE en vivo vía API

TIX ya NO usa una lista de nombres fija memorizada. Al inicio de cada sesión
(o antes del primer registro del día si aún no la ha cargado), TIX debe
consultar el roster real de la empresa con un tool HTTP Request:

- **Endpoint:** `GET https://api.talentix.com.do/empresas/iagil-bots-ia/empleados`
- **Header requerido:** `x-codigo-acceso: IAGIL-2026`
- **Tool en ClawLink:** HTTP Request (GET) — no un tool de base de datos

La respuesta es un array de objetos, uno por talento, con este formato:

```json
[
  {
    "id": "clx...",
    "nombreCompleto": "Norma Hincapié",
    "rol": "Contadora",
    "estado": "activo",
    "puntajeIAPromedio": 8.5,
    "totalBitacoras": 12,
    "porcentajeCumplimiento": 90,
    "cumplimientoTareasPromedio": 88
  }
]
```

Reglas de uso:

- Usa únicamente los registros con `"estado": "activo"` como talentos válidos
  para check-in/check-out. Los `"inactivo"` no deben recibir registros nuevos.
- El nombre válido para `talentoNombre` en check-in/check-out es el valor
  exacto de `nombreCompleto` de esta respuesta.
- Carga esta lista UNA VEZ por sesión (o por día) y reutilízala para todos
  los mensajes que procese en ese periodo — no la vuelvas a pedir en cada
  mensaje individual.
- Si el mensaje viene de alguien que no aparece como activo en esta lista →
  no registres nada y pide confirmación (mismo criterio que antes).

> Como esta lista ahora se obtiene en vivo desde la base de datos, agregar,
> desactivar o cambiar el rol de un talento se hace SOLO desde el panel
> admin del dashboard — nunca editando este archivo, y TIX no necesita que
> nadie "se lo presente" manualmente.

**Si el endpoint de `/empleados` falla** (error de red, 401, 500): usa el
snapshot de respaldo de abajo como última lista conocida, avisa en tu
respuesta que la lista podría estar desactualizada, y notifica al
administrador (protocolo de SOUL.md PASO 6).

### Snapshot de respaldo (última lista conocida — NO autoritativa)

```
1. Charlenys Frias      → Project Manager + Setter B2B + App Gym
2. Maria Suero          → Líder Agencia GHL + Estratega IA + Oralyx
3. Eric Vizcaino        → Líder Implementador GHL + Estratega IA + Jarvis + Talentix
4. Yefferson Gonzales   → Líder Implementador GHL + Estratega IA + Repi + Talentix
5. Arnold Suarez        → Ingeniero de Soporte — Local e Internacional + Constructoras
6. Peter Chavez         → Ingeniero de Soporte — Local e Internacional + Aegis
7. Danny Solis          → Ingeniero de Soporte — Cuenta Baxter + Apps
8. Brayan Pérez         → Ingeniero de Soporte — Cuenta Baxter + Aegis
9. Norma Hincapié       → Contadora
10. Angel Geraldo       → Soporte TI
```

---

## ⚠️ Errores críticos y soluciones

| Error | Consecuencia | Solución |
|---|---|---|
| `empresaSlug` distinto de `iagil-bots-ia` | API responde 404, nada se guarda | Usar siempre `iagil-bots-ia` |
| `talentoNombre` no coincide exacto | API responde 404 (talento no encontrado) | Copiar `nombreCompleto` exacto de la última respuesta de `GET /empleados` |
| No se consultó `GET /empleados` antes de registrar, o se usó el snapshot desactualizado | Talentos nuevos no se reconocen, o se intenta registrar a alguien inactivo/dado de baja | Volver a consultar `GET /empleados` al inicio de la sesión antes de procesar check-in/check-out |
| `estadoEnvio` vacío u omitido en el checkout | La API asume `✅ Enviada` por defecto — puede ser incorrecto | Enviarlo siempre explícito |
| `puntajeIA` vacío con estado `✅ Enviada` | Ranking del dashboard no calcula bien ese registro | Siempre número 0-10 |
| `cumplimientoTareas` inventado sin check-in real | Métrica de cumplimiento de tareas queda falsa en el dashboard | Solo calcularlo si existe `tareasPlanificadas` de ese día |
| Fecha en formato incorrecto | Filtros por fecha del dashboard no funcionan | Siempre `"YYYY-MM-DD"` |
| Llamar a un endpoint que no sea `POST /worklogs/checkin` o `/checkout` para escribir | Puede fallar o requerir autenticación admin que TIX no tiene | Solo usar esos dos endpoints para registrar |
| Intentar usar un tool de base de datos/SQL/Neon (ej. `neon_query`) en vez del tool HTTP Request | El tool no existe para TIX → error "herramienta no encontrada" y nada se registra | Usar siempre el tool HTTP Request contra la API, nunca un conector directo a la base de datos |

> ❌ PROHIBIDO: TIX no debe agregar nuevas secciones, endpoints, APIs
> ni herramientas a este archivo. Solo el CEO o el administrador del
> sistema pueden modificar este archivo. Si TIX necesita recordar algo,
> lo escribe en su memory diaria, nunca aquí.

---

*TOOLS.md de TIX — Talentix | IAGIL*
*Integración confirmada en producción: API REST vía ClawLink (tool HTTP Request) — check-in + check-out en la misma fila diaria*
