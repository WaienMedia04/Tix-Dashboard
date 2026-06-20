# Talentix — Arquitectura Multi-Tenant Escalable (500-1000 empresas)

> Refinamiento sobre el diagrama original. Mismo stack base (NestJS + PostgreSQL + Cloudflare R2), con los ajustes necesarios para soportar cientos de tenants de forma segura y sostenible operativamente.

---

## 1. Lo que ya está bien diseñado

- **NestJS como API central** (Auth, autorización, ingesta, reportes) — correcto, modular y con buen soporte para patrones multi-tenant vía Guards/Interceptors.
- **PostgreSQL** como base relacional — correcto. Tus datos (WorkLogs, KPIs, Users, Evaluations) son altamente relacionales y necesitas JOINs/agregaciones para rankings y reportes; un NoSQL aquí sería un error.
- **Cloudflare R2** para CVs/PDFs — buena elección, compatible con S3 API, sin costos de egress (importante cuando tengas cientos de empresas descargando reportes).
- **Empresa ID / Tenant ID / API Key** generados en onboarding — es la base correcta para aislamiento por tenant.
- **Separación ingesta diaria vs. procesamiento nocturno** — patrón correcto: no recalculas KPIs en tiempo real, los calculas en batch y sirves desde cache/tablas pre-calculadas.

---

## 2. Canal de WhatsApp — modelo real: bot dentro de un grupo por empresa

**Actualización tras confirmar el flujo real con el cliente:** el modelo no es "cada empresa con su propio número verificado". Es: **un bot de Talentix (tu número), agregado a un grupo de WhatsApp distinto por cada empresa**, donde los empleados de esa empresa son los participantes y reportan ahí sus bitácoras. El cliente (CEO) no gestiona ningún número — solo recibe el dashboard y comparte el link de invitación al grupo con su equipo.

### La pieza que lo hace posible: Groups API del WhatsApp Cloud API oficial
Meta lanzó (finales de 2025, en evolución activa) una API de grupos dentro del Cloud API oficial que permite:
- Crear y administrar grupos por API (Group Management Reference).
- Generar links de invitación por grupo (Groups Invite Link API).
- Enviar y recibir mensajes de texto/multimedia dentro del grupo.
- Cada mensaje entrante llega por webhook con `group_id` (qué grupo = qué empresa) y el número del participante que lo envió (qué empleado).

**Implicación clave para tu escala de 500-1000 empresas:** no necesitas 1000 números de WhatsApp Business verificados. **Un solo número/cuenta de Talentix puede ser miembro de cientos o miles de grupos simultáneamente.** El multi-tenancy de WhatsApp se resuelve con `group_id`, exactamente con la misma lógica que ya usas para `empresa_id` en Postgres — son el mismo concepto en dos capas distintas.

### Flujo de onboarding actualizado
1. Cliente crea su empresa en app.talentix.com.
2. NestJS llama a la Groups API (bajo tu cuenta de WhatsApp Business) → crea un grupo nuevo, guarda `group_id` en la tabla `empresas`.
3. NestJS genera el link de invitación del grupo y lo muestra en el dashboard del cliente.
4. El cliente comparte el link con sus empleados → cada uno se une desde WhatsApp normal, sin fricción.
5. Cada empleado se presenta en el grupo → el webhook trae `group_id` + número del participante → tu backend crea/vincula el `talento` a la `empresa_id` correspondiente (vía el `group_id` guardado en el paso 2).
6. Bitácoras diarias se reportan en el mismo grupo → el agente IA las procesa igual que en el diagrama original (clasificación de productividad, extracción de KPIs).

### Ventaja de costo
Cada vez que un miembro del grupo escribe, se abre una ventana de 24h en la que tus respuestas del bot dentro del grupo no tienen costo de conversación. Como tus empleados reportan a diario, la mayoría de la actividad del bot cae dentro de esa ventana gratuita.

### Advertencias antes de comprometerte
- Es una API **muy reciente** (rollout iniciado ~octubre 2025, documentación actualizada en mayo 2026) — hay menos ejemplos de implementación en producción y posibles aristas no documentadas.
- No todos los BSP (360dialog, Twilio, etc.) tienen necesariamente esta función expuesta todavía — verifica directamente con cada uno antes de elegir, o ve directo con Meta (Cloud API de Meta directamente, sin intermediario) ya que es la fuente original de la función.
- Haz una prueba piloto real con un grupo de prueba antes de construir el flujo completo de onboarding automático.
- Tu número de WhatsApp Business sigue necesitando verificación de negocio ante Meta una sola vez (no por cada cliente) — esto es mucho más manejable que verificar 1000 números.

**Acción inmediata:** validar con una prueba técnica (crear un grupo de prueba vía API, agregar 2-3 números, enviar/recibir mensajes) antes de construir el "Agente IA personalizado" sobre este supuesto.

---

## 2.5. Métricas específicas por empresa (sin tocar código por cada cliente nuevo)

Cada empresa necesita, además de las métricas generales (cumplimiento, puntaje IA, ranking), un set propio de métricas que el bot debe extraer y reportar (ej. ventas cerradas, llamadas atendidas, lo que sea relevante para ese negocio). Para que esto no implique desarrollo nuevo por cada cliente, se separa en **definición** (schema configurable) y **valores** (datos reportados):

```sql
-- Definición de qué mide cada empresa (se configura una vez en el onboarding)
create table metricas_config (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) not null,
  clave text not null,              -- 'ventas_cerradas', 'llamadas_atendidas'
  etiqueta text not null,           -- "Ventas Cerradas" (lo que ve el CEO)
  tipo text not null,               -- 'numero' | 'porcentaje' | 'moneda' | 'texto_corto'
  unidad text,
  orden int default 0,
  unique(empresa_id, clave)
);

-- Valores reportados día a día por el bot, según esa definición
create table metricas_valores (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) not null,
  talento_id uuid references talentos(id),
  worklog_id uuid references worklogs(id),
  fecha date not null,
  valores jsonb not null,           -- { "ventas_cerradas": 5000, "llamadas_atendidas": 23 }
  creado_en timestamptz default now()
);
create index idx_metricas_valores_empresa_fecha on metricas_valores(empresa_id, fecha);
create index idx_metricas_valores_gin on metricas_valores using gin(valores);

alter table metricas_config enable row level security;
alter table metricas_valores enable row level security;
create policy tenant_isolation on metricas_config using (empresa_id = current_setting('app.current_tenant')::uuid);
create policy tenant_isolation on metricas_valores using (empresa_id = current_setting('app.current_tenant')::uuid);
```

**Entrada (bot → API):** un único endpoint `POST /metrics` para todas las empresas. El agente IA carga `metricas_config` de la empresa correspondiente (vía `group_id`) junto con su `system_prompt`, sabe qué claves extraer de la bitácora, y devuelve un JSON que se guarda directo en `metricas_valores.valores`. Sin código nuevo por cliente.

**Salida (API → dashboard):** un único endpoint `GET /empresas/:id/metricas-custom` que devuelve definición + valores. En el frontend, un solo componente genérico (tipo `<MetricCard definicion={...} valores={...} />`) se reutiliza para cualquier métrica de cualquier empresa, renderizándose distinto según el `tipo`.

**Estructura del dashboard por empresa:**
- Sección "General" (igual para todas): cumplimiento, puntaje IA, ranking — datos de `kpis`/`evaluations`.
- Sección "Específicas de tu empresa" (dinámica): se genera iterando `metricas_config` de esa empresa.

Onboardear un cliente con métricas distintas se vuelve un formulario de configuración, no un ticket de desarrollo.

## 3. Multi-tenancy: Postgres con Row Level Security (defensa en profundidad)

No uses una base de datos o schema por empresa — a 500-1000 tenants eso es una pesadilla de migraciones y backups. Una sola base, **una columna `empresa_id` en cada tabla + RLS** activado:

```sql
-- ===== EMPRESAS (tenants) =====
create table empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  plan text not null default 'starter',          -- starter / pro / enterprise
  whatsapp_group_id text unique,                   -- group_id del grupo de WhatsApp de esta empresa
  whatsapp_invite_link text,                       -- link de invitación vigente del grupo
  api_key_hash text not null,                      -- hash, nunca texto plano
  estado text not null default 'activo',
  creado_en timestamptz default now()
);

-- ===== USUARIOS del dashboard (CEO, RRHH, Supervisores) =====
create table usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) not null,
  email text unique not null,
  rol text not null,                               -- ceo / rrhh / supervisor
  password_hash text not null,
  creado_en timestamptz default now()
);

-- ===== TALENTOS (empleados que envían bitácoras) =====
create table talentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) not null,
  nombre_completo text not null,
  rol text,
  numero_whatsapp text,
  supervisor_id uuid references talentos(id),
  estado text default 'activo'
);

-- ===== WORKLOGS (bitácoras — la tabla de mayor volumen) =====
create table worklogs (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) not null,
  talento_id uuid references talentos(id) not null,
  fecha date not null,
  contenido_raw text not null,                     -- mensaje original de WhatsApp
  actividades text,
  objetivo_dia text,
  estado_envio text default 'enviada',
  hora_envio time,
  creado_en timestamptz default now()
);
create index idx_worklogs_empresa_fecha on worklogs(empresa_id, fecha);
create index idx_worklogs_talento on worklogs(talento_id);

-- ===== KPIS (resultado del análisis del agente IA) =====
create table kpis (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) not null,
  worklog_id uuid references worklogs(id) not null,
  talento_id uuid references talentos(id) not null,
  puntaje_ia numeric,
  clasificacion text,                              -- alta / media / baja productividad
  resumen_ia text,
  creado_en timestamptz default now()
);
create index idx_kpis_empresa_talento on kpis(empresa_id, talento_id);

-- ===== EVALUATIONS (ranking, insights, calificación CEO) =====
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) not null,
  talento_id uuid references talentos(id) not null,
  periodo text not null,                           -- '2026-06' por ejemplo
  ranking_posicion int,
  puntaje_compuesto numeric,
  insights_ia jsonb,
  creado_en timestamptz default now()
);

-- ===== RLS: el motor de Postgres bloquea cruces entre empresas =====
alter table worklogs enable row level security;
alter table kpis enable row level security;
alter table evaluations enable row level security;
alter table talentos enable row level security;
alter table usuarios enable row level security;

create policy tenant_isolation on worklogs
  using (empresa_id = current_setting('app.current_tenant')::uuid);
create policy tenant_isolation on kpis
  using (empresa_id = current_setting('app.current_tenant')::uuid);
create policy tenant_isolation on evaluations
  using (empresa_id = current_setting('app.current_tenant')::uuid);
create policy tenant_isolation on talentos
  using (empresa_id = current_setting('app.current_tenant')::uuid);
create policy tenant_isolation on usuarios
  using (empresa_id = current_setting('app.current_tenant')::uuid);
```

### ¿Por qué RLS y no solo `WHERE empresa_id = ?` en NestJS?
Porque a 1000 tenants, un solo desarrollador (tú, o quien contrates después) eventualmente va a olvidar un `WHERE` en algún query nuevo. Con RLS, aunque el código de la aplicación tenga un bug, **la base de datos físicamente no devuelve filas de otra empresa**. Es la diferencia entre "confiamos en que el código esté bien" y "es imposible que falle", que es justo lo que necesitas vendiéndole esto a clientes que confían su data interna de productividad.

### Cómo se conecta esto en NestJS
Un middleware/interceptor que, en cada request autenticado (JWT de dashboard o API Key del agente), hace:

```typescript
// tenant.interceptor.ts (concepto)
async intercept(context: ExecutionContext, next: CallHandler) {
  const empresaId = this.extraerTenantDelRequest(context); // del JWT o API Key
  await this.prisma.$executeRawUnsafe(
    `SET app.current_tenant = '${empresaId}'`
  );
  return next.handle();
}
```

Esto se aplica una vez por conexión/transacción y desde ahí, todas las queries quedan automáticamente filtradas por RLS — el resto del código de NestJS ni siquiera necesita pensar en `empresa_id` en los `WHERE`.

---

## 4. Procesamiento nocturno: de "un job" a una cola escalable

Un solo proceso secuencial a la 1:00 AM funciona con 5 empresas. Con 500-1000, el job puede tardar horas o caerse a la mitad sin reintento. Solución: **BullMQ + Redis**.

- El "Analizador de productividad nocturno" no procesa todo en un loop — encola **un job por empresa** (o por lote de empresas).
- Varios workers (procesos NestJS separados) consumen la cola en paralelo.
- Si una empresa falla (ej. error de datos), reintenta solo esa empresa, sin bloquear a las demás 999.
- Mismo patrón sirve para el "Motor de reportes" (PDF/Excel) — generación asíncrona en cola, no bloqueante, especialmente importante a fin de mes cuando muchas empresas pedirán su reporte mensual al mismo tiempo.

---

## 5. Hosting recomendado para esta escala

| Componente | Opción recomendada | Por qué |
|---|---|---|
| PostgreSQL | Gestionado (Supabase, Neon, o RDS) en vez de Postgres manual en VPS | Backups automáticos, point-in-time recovery, escalado vertical sin downtime — a 1000 empresas no quieres administrar esto a mano |
| Redis (colas) | Gestionado (Upstash, Redis Cloud) | Mismo argumento — evitas ser tú el SRE de tu propia cola de trabajos |
| NestJS API | Contenedores (Docker) en Railway/Render/Fly.io para empezar, migrar a infraestructura con autoscaling cuando pases de ~100 empresas activas | Permite escalar horizontalmente agregando instancias según carga |
| Cloudflare R2 | Tal como lo tienes | Correcto, sin cambios |
| WhatsApp | BSP o Cloud API directa (sección 2) | Reemplaza el componente actual de sesión por navegador |

---

## 6. Roadmap sugerido (para no bloquear a los 5 clientes que esperan)

**Fase 1 — Lanzamiento con los 5 clientes actuales**
1. Resolver canal de WhatsApp (BSP recomendado por velocidad de implementación).
2. Schema con RLS desde el día uno (no es más trabajo hacerlo bien ahora que migrar después con datos reales).
3. NestJS con interceptor de tenant + API Key por empresa para el agente.
4. Dashboard mínimo viable (CEO Dashboard) conectado por API REST.

**Fase 2 — Antes de pasar de ~50-100 empresas**
5. Migrar procesamiento nocturno y motor de reportes a BullMQ + Redis.
6. Postgres/Redis gestionados si aún están en VPS propio.
7. Monitoreo (logs estructurados + alertas) por tenant, para detectar fallos de un cliente específico sin esperar que te escriba.

**Fase 3 — Camino a 500-1000**
8. Autoscaling de la API NestJS.
9. Particionamiento de `worklogs` por mes si el volumen lo justifica (probablemente no hasta pasar el millón de filas/año).
10. Rate limiting por plan (starter/pro/enterprise) en ingesta y en uso del agente IA, para controlar costo de tokens de IA por tenant.

---

## 7. Decisiones que necesito que confirmes

- **WhatsApp:** ¿BSP (rápido de lanzar) o Cloud API directa con Meta (más control, más fricción de setup)?
- **Hosting de Postgres:** ¿prefieres mantenerlo en tu VPS de Hostinger o migrar a un Postgres gestionado tipo Supabase/Neon?
- **Frontend del dashboard:** aún sin definir — esto determina si el "Dashboard en vivo" se conecta por REST polling o WebSockets/Supabase Realtime.
