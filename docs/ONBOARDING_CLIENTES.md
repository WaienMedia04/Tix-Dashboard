# Onboarding de clientes — Implementación de TalentiX

Checklist interno: qué información hay que levantarle a un cliente nuevo
antes (y durante) de implementarle la plataforma, y qué hacemos con cada
dato una vez lo tenemos. TalentiX es la misma plataforma para todos los
clientes, pero cada empresa mide y organiza a su gente distinto — por eso
casi todo lo de abajo no tiene un valor "por defecto" correcto: hay que
preguntarlo.

Está organizado en el orden en que normalmente se necesita la información,
no por importancia. La Fase 6 (cómo mide el cliente a sus talentos) es la
más importante y la que más tiempo toma — es la que después moldea el
agente TIX de ese cliente.

---

## Fase 1 — Datos generales de la empresa

Esto crea el registro `Empresa` en el panel admin.

- **Nombre legal / comercial de la empresa**
- **Slug** (identificador en URLs, ej. `iagil-bots-ia`) — si no lo dan, se genera del nombre. Es inmutable una vez creado, hay que acertarlo.
- **Plan:** `starter` | `pro` | `enterprise` — define qué tanto pueden usar del sistema. Si no está definido de antemano, preguntar qué se les vendió comercialmente.
- **Tipo de industria / a qué se dedica** — no es un campo del sistema, pero ayuda a calibrar la Fase 6 (las métricas de una agencia de marketing no son las de una constructora).
- **Cantidad total de empleados** que van a estar en la plataforma (activos, para dimensionar).
- **Logo** (PNG/JPEG/WebP/SVG) — se sube desde el panel admin.
- **Código de acceso** (`codigoAcceso`) — el que usan CEO/RRHH para entrar además de su correo/contraseña, y el que usa el agente TIX para autenticar sus llamadas a la API. Se puede generar automático o pedirle al cliente uno memorable.

---

## Fase 2 — Estructura organizacional: departamentos

TalentiX filtra dashboards, reportes, rankings y permisos de MANAGER/GERENTE_GENERAL por departamento — por eso esto hay que definirlo bien desde el principio, no improvisarlo después.

- **Lista completa de departamentos** (ej. Ventas, Soporte, Contabilidad, Desarrollo...). Se crean uno por uno en el panel admin (`DepartamentoDefinicion`) y quedan como catálogo fijo para esa empresa — una vez hay al menos uno, el campo "Departamento" en toda la plataforma pasa de texto libre a lista desplegable.
- **¿Todos los talentos pertenecen a un departamento, o hay roles "sueltos"** (ej. el propio CEO, o un asistente que no encaja en ninguno)?
- **¿Hay algún talento con más de un departamento/rol a la vez** (como se ve hoy en IAGIL, ej. "Líder Implementador GHL + Estratega IA + Jarvis")? Si sí, hay que decidir con el cliente cuál es su departamento PRINCIPAL para efectos de filtros — el sistema solo permite uno por talento.
- **Jerarquía de supervisión:**
  - ¿Quién es **MANAGER** de cada departamento? (un MANAGER ve solo su propio departamento)
  - ¿Hay un **GERENTE_GENERAL** que supervisa varios departamentos a la vez? ¿Cuáles?
  - ¿Quién es **CEO** / **RRHH** (ve todo, sin restricción)?

---

## Fase 3 — Roster de talentos (empleados)

Por cada talento que se vaya a registrar:

- **Nombre completo exacto** — este es el dato más crítico de todos: es la llave que usa el agente TIX para identificar a quién pertenece cada bitácora (`talentoNombre`, comparado sin distinguir mayúsculas pero exacto en lo demás). Un nombre inconsistente entre "cómo lo escribe el talento en WhatsApp" y "cómo está en el sistema" causa registros perdidos.
- **Rol/puesto** (texto libre, ej. "Contadora", "Ingeniero de Soporte")
- **Departamento** (de la lista de la Fase 2)
- **Cédula, correo personal, teléfono, dirección** (opcionales, para la ficha del empleado)
- **Fecha de ingreso** y **fecha de nacimiento** (esta última habilita el módulo de Cumpleaños)
- **Foto de perfil**
- **¿Este talento va a tener login propio en el panel** (para ver su mural, marcar bitácoras desde ahí en vez de WhatsApp, etc.) **o solo existe como registro que TIX alimenta por WhatsApp?** Si va a tener login: correo de invitación + rol de acceso (`TALENTO`, `MANAGER`, `GERENTE_GENERAL`, `RRHH`, `CEO`).

> El roster también se puede cargar rápido si el cliente ya tiene un Excel/Sheet con esta info — solo hace falta mapear las columnas a estos mismos campos.

---

## Fase 4 — CV y descripción de puesto (opcional, para IA de reclutamiento)

Solo si el cliente va a usar el módulo de Vacantes / matching de candidatos internos con IA:

- **CV en PDF de cada talento** (se sube por talento; el sistema extrae datos automáticamente con IA — experiencia, habilidades, educación).
- **Descripción de puesto** de cada rol/vacante que quieran tener documentada — se usa para comparar contra los CVs cuando publiquen una vacante y quieran ver qué talento interno encaja mejor.
- Si el cliente NO va a usar este módulo, se puede omitir esta fase por completo sin afectar nada más de la plataforma.

---

## Fase 5 — Bitácoras: canal y horario con el agente TIX

Esto configura el agente conversacional (mismo TIX, una instancia por cliente — ver "Carpeta de agentes" más abajo).

- **Canal:** ¿el agente va a estar en un **grupo de WhatsApp** (todos los talentos juntos, como IAGIL con "Bitácoras de CheckOut") o le van a escribir **por privado** cada uno a un número dedicado? Cada modelo tiene un protocolo de respuesta distinto (grupo = una sola línea, nunca preguntas; privado puede ser más conversacional).
- Si es grupo: **nombre exacto del grupo de WhatsApp**.
- Si es privado: **el número de WhatsApp** que van a usar como "TIX" para ese cliente, y si cada talento habla desde su propio número personal (para poder identificarlo) o hay algún caso de números compartidos.
- **Horario de check-in** (tareas planificadas del día) y **horario de check-out** (qué se hizo) — HH:MM de inicio y de cierre de cada ventana. Si el cliente no hace check-in por la mañana y solo quiere el reporte de la tarde, se puede omitir esa mitad del protocolo.
- **Días laborales** (¿de lunes a viernes? ¿incluye sábados?) y **zona horaria** si no es Santo Domingo (AST, UTC-4).
- **¿Quién recibe las alertas y reportes** (ausencias, bajo cumplimiento, resumen semanal)? Normalmente el CEO, pero puede ser RRHH u otra persona — nombre y cómo prefiere que le hablen ("CEO", su nombre, etc.).

---

## Fase 6 — Cómo se mide el desempeño (la parte que hace único a cada cliente)

Esta es la fase que **moldea** el rubro de puntuación del agente TIX de ese
cliente — no es un campo de la base de datos, es la lógica que el agente
aplica al leer cada bitácora. Hay que preguntarle al cliente, con ejemplos
concretos si es posible:

- **¿Qué significa "un buen día de trabajo" para ustedes?** ¿Cantidad de tareas cerradas, calidad/detalle del reporte, cumplimiento de lo planificado, resultados medibles (ventas, tickets resueltos, horas facturables)?
- **¿La forma de medir es la MISMA para todos los talentos, o cambia según el rol/departamento?** (ej. a un vendedor se le puede medir por cierres y monto vendido; a un soporte técnico por tickets resueltos y tiempo de respuesta; a alguien administrativo por tareas completadas sin más). Si cambia por rol, hay que documentar el criterio de cada grupo por separado.
- **¿Qué cuenta como capacitación/aprendizaje** para ellos, si es que lo valoran?
- **¿Qué haría que un reporte se califique bajo** — mensajes vagos, sin nombres de clientes/proyectos, sin resultados medibles, ¿algo más específico de su negocio?
- **Escala de puntaje:** ¿el 0-10 estilo IAGIL les sirve, o prefieren otra escala (0-100, letras A-F, etc.)? El campo en la base de datos acepta cualquier entero — la escala es una convención del agente, no una restricción técnica.
- **Cumplimiento de tareas (check-in vs. check-out):** ¿les interesa esta métrica (comparar lo planificado contra lo ejecutado) o solo quieren la calidad del reporte de check-out, sin check-in por la mañana?
- **Ausencias:** ¿qué tipos de permiso manejan (médico, personal, vacaciones) y quién los autoriza?
- **"Talento del mes/semana":** ¿en qué se basa para ellos — el puntaje más alto, el mejor cumplimiento, una combinación, o algo que ellos ya usan hoy (ej. una votación, un KPI de ventas)?

> El resultado de esta fase se escribe directo en el `SOUL.md` del agente
> de ese cliente (la sección "Asignar Puntaje IA" y "Cumplimiento de
> Tareas"), reemplazando el rubro por defecto de IAGIL por el suyo.

---

## Fase 7 — Módulos opcionales a activar

TalentiX tiene módulos que no todos los clientes necesitan desde el día
uno — preguntar cuáles quieren activos, para no configurar de más ni
confundir al equipo con secciones vacías:

| Módulo | Necesita del cliente |
|---|---|
| **Estampas** (medallas/reconocimientos) | Definir qué estampas quieren (nombre + imagen de cada una) y quién las otorga |
| **Mural informativo** (noticias/eventos/blog) | Quién va a publicar contenido (normalmente RRHH) |
| **Novedades** (logros, buenas acciones, situaciones del equipo) | Nada extra — se usa igual para todos, solo confirmar si lo quieren visible |
| **Vacantes + matching de candidatos con IA** | Ver Fase 4 (CVs y descripciones de puesto) |
| **Cumpleaños** | Fecha de nacimiento de cada talento (Fase 3) |
| **Reportes Ejecutivos con análisis de IA** | Nada extra — usa los mismos datos de bitácoras, es solo un análisis narrativo adicional |
| **Sucursales / accesos vinculados** (un CEO/RRHH con acceso a más de una empresa) | Solo si el cliente tiene más de una razón social/sucursal en TalentiX |

---

## Fase 8 — Checklist técnico de implementación (lo que hacemos nosotros)

Una vez se tiene toda la información de arriba, el orden real de montaje es:

1. Crear la `Empresa` en el panel admin (Fase 1).
2. Crear los `Departamentos` (Fase 2).
3. Crear los `Talentos` — roster completo (Fase 3), o importarlos si hay un Excel.
4. Crear los `Usuarios`/accesos de login que correspondan (CEO, RRHH, MANAGER por departamento, GERENTE_GENERAL, y los TALENTO que vayan a tener panel propio) — se les envía invitación por correo para que fijen su contraseña.
5. Subir logo y confirmar plan/código de acceso.
6. Si aplica: subir CVs y activar Vacantes (Fase 4).
7. Crear la instancia del agente TIX para este cliente — copiar la carpeta de agente base y adaptarla con lo de las Fases 5 y 6 (ver siguiente sección).
8. Conectar el bot en WhatsApp con las instrucciones del panel "Conectar Bot" (URL, `empresaSlug`, `codigoAcceso`) — ahí mismo se genera el bloque para pegar en la configuración del agente.
9. Prueba en vivo: un check-in y un check-out de prueba, confirmar que aparece en el dashboard.
10. Activar los módulos opcionales que el cliente pidió (Fase 7).

---

## Carpeta de agentes por cliente

Cada cliente tiene su propia instancia del agente TIX — mismo comportamiento
base, pero con el canal (Fase 5) y el rubro de medición (Fase 6) moldeados
a lo que indicó ese cliente específico.

```
agentes/
  Agente <Nombre del Cliente>/
    AGENTS.md      — punto de entrada, qué leer en cada sesión
    IDENTITY.md    — quién es el agente para ese cliente (nombre si lo personalizan, misión)
    SOUL.md        — protocolo completo, con el rubro de puntaje/cumplimiento YA moldeado a ese cliente
    TOOLS.md       — mismos endpoints de la API (no cambian entre clientes, solo el slug/código de acceso)
    USER.md        — perfil de a quién le reporta (CEO/RRHH de ese cliente)
    HEARTBEAT.md   — horario de check-in/check-out de ese cliente
    MEMORY.md      — memoria de largo plazo, empieza vacía para un cliente nuevo
```

El primer cliente implementado (IAGIL, la propia empresa) vive en
`agentes/Agente IAGIL/` como referencia. Para un cliente nuevo: se copia
esa carpeta completa a `agentes/<cliente-nuevo>/` y se ajustan `SOUL.md`
(Fase 6), `HEARTBEAT.md`/`TOOLS.md` (slug, código de acceso, horario de
Fase 5) y `USER.md` (a quién le reporta) — el resto (TOOLS.md en su
mayoría, la estructura de AGENTS.md) se mantiene igual porque la API no
cambia entre clientes.
