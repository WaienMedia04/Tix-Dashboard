# Despliegue de TalentiX RD a producción

Este repositorio contiene dos proyectos independientes que se despliegan por separado:

- **API NestJS** (raíz del repo) → Railway
- **Dashboard Next.js** (`/dashboard`) → Vercel

Dominio objetivo: `panel.talentix.com.do` (dashboard) + un subdominio para la API
(ej. `api.talentix.com.do`).

Sigue los pasos en orden: primero la API, luego el dashboard (necesita la URL de la
API), y al final el DNS.

---

## 1. Backend (NestJS) en Railway

### 1.1 Crear el servicio

1. En Railway, **New Project → Deploy from GitHub repo** y selecciona este
   repositorio.
2. En **Settings → Root Directory**, déjalo en blanco / `/` (el backend vive en la
   raíz del repo, no en `/dashboard`).
3. En **Settings → Build**, configura:
   - **Build Command:** `npm install && npm run build`
     (`npm install` ya dispara `postinstall` → `prisma generate`; el script
     `build` también corre `prisma generate` de forma explícita antes de
     `nest build`)
   - **Start Command:** `node dist/main.js`
4. En **Settings → Deploy → Release Command** (Railway lo corre una sola vez
   antes de que la nueva versión reciba tráfico, NO en cada reinicio):
   - **Release Command:** `npx prisma migrate deploy`
     (NUNCA `migrate dev` en producción — `migrate deploy` solo aplica
     migraciones ya generadas en `prisma/migrations/`, no crea nuevas ni pide
     confirmación interactiva. Si no usas Release Command, como alternativa
     puedes encadenarlo en el Start Command: `npx prisma migrate deploy &&
     node dist/main.js`, pero el Release Command es la forma correcta porque
     corre una sola vez por deploy, no en cada arranque/escalado de instancia)

### 1.2 Variables de entorno

En **Variables**, agrega:

| Variable | Valor | Notas |
|---|---|---|
| `DATABASE_URL` | connection string de Neon, **host SIN `-pooler`** (conexión directa) | ver nota abajo — con `-pooler` falla `prisma migrate deploy` |
| `CORS_ORIGIN` | `https://panel.talentix.com.do` | dominio exacto del dashboard en producción (sin slash final) |
| `ADMIN_TOKEN` | un valor aleatorio largo | genera uno con `openssl rand -hex 32`. Protege `GET /empresas` |
| `MISTRAL_API_KEY` | tu API key de [console.mistral.ai](https://console.mistral.ai) | extracción de datos de CVs por IA. Sin esta variable, la subida de CV se guarda igual pero `cvDatosExtraidos` queda en `null` |

`PORT` no hace falta configurarlo: Railway lo inyecta automáticamente y el código ya
usa `process.env.PORT ?? 3000`.

**Por qué `DATABASE_URL` debe ser la conexión directa de Neon (sin `-pooler`):**
`src/prisma/prisma.service.ts` usa el driver adapter `@prisma/adapter-pg`
(`PrismaPg`), que ya trae su propio pool de conexiones (vía `pg.Pool`) — el
pooler de Neon (PgBouncer en modo *transaction*) es redundante encima de eso y,
peor, rompe `prisma migrate deploy`: el Release Command necesita un advisory
lock a nivel de sesión (`pg_advisory_lock`) para evitar que dos deploys
apliquen migraciones a la vez, y PgBouncer en modo transaction no garantiza
que las consultas de una misma "sesión" lógica caigan en la misma conexión
real — el resultado es `Error: P1002 ... Timed out trying to acquire a
postgres advisory lock`. En el dashboard de Neon, la connection string sin
`-pooler` en el host es la conexión directa; úsala tanto en local (`.env`)
como en Railway.

### 1.3 Dominio personalizado de la API

1. En **Settings → Networking → Custom Domain**, agrega tu subdominio, ej.
   `api.talentix.com.do`.
2. Railway te mostrará un registro **CNAME** a crear en tu proveedor de DNS,
   con un valor parecido a `xxxxx.up.railway.app` (el valor exacto lo genera Railway
   en el momento, cópialo tal cual te lo muestre).
3. Una vez verificado el dominio, **anota la URL final** (`https://api.talentix.com.do`)
   — la necesitas para el paso 2.

### 1.4 Verificación

Después del primer deploy, prueba desde tu terminal:

```bash
curl https://api.talentix.com.do/empresas/iagil-bots-ia/dashboard?codigoAcceso=IAGIL-2026
```

Debe responder con el JSON del dashboard (HTTP 200). Si responde 401, revisa que el
código de acceso siga siendo el correcto en la base de producción.

---

## 2. Dashboard (Next.js) en Vercel

### 2.1 Crear el proyecto

1. En Vercel, **Add New → Project** e importa el mismo repositorio de GitHub.
2. En la configuración del proyecto, **Root Directory → `dashboard`** (muy
   importante: si no lo cambias, Vercel intentará construir el repo completo desde
   la raíz y fallará).
3. Framework Preset: Next.js (Vercel lo detecta automáticamente al fijar el Root
   Directory).
4. Build Command y Output Directory: deja los valores por defecto de Next.js.

### 2.2 Variable de entorno

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.talentix.com.do` (la URL final de Railway del paso 1.3) |

Agrégala para los entornos **Production** y **Preview**. Sin esta variable el
dashboard intentará hablar con `http://localhost:3000` y todo fallará en
producción.

### 2.3 Vercel Blob (subida de archivos)

Fotos de perfil, CVs, la imagen del carnet, el logo de la empresa y las
estampas se suben con [Vercel Blob](https://vercel.com/docs/storage/vercel-blob).
Esto requiere un **Blob store** conectado al proyecto — si no lo creas, **toda**
subida de archivo falla (el usuario ve un error genérico tipo "No se pudo subir
la imagen. Intenta de nuevo.", sin más detalle).

1. En el proyecto de Vercel, ve a **Storage → Create Database → Blob**.
2. Crea el store y **conéctalo a este proyecto** (Vercel te lo ofrece en el mismo
   flujo). Al conectarlo, Vercel inyecta automáticamente la variable
   `BLOB_READ_WRITE_TOKEN` en **Production** y **Preview** — no hace falta
   copiarla ni pegarla a mano.
3. Vuelve a desplegar (**Deployments → ⋯ → Redeploy**) para que el nuevo entorno
   incluya la variable.
4. Verifica subiendo una foto de perfil desde `Empleados → (empleado) → editar` —
   si el store no está conectado, verás el error de subida mencionado arriba.

### 2.4 Dominio personalizado del dashboard

1. En **Settings → Domains**, agrega `panel.talentix.com.do`.
2. Vercel te mostrará el registro a crear en tu DNS — normalmente un **CNAME** a
   `cname.vercel-dns.com` (Vercel confirma el valor exacto en pantalla; si el
   subdominio fuera el dominio raíz pediría un registro `A`, pero `panel.` es un
   subdominio así que será CNAME).

### 2.5 Verificación

Visita `https://panel.talentix.com.do/iagil-bots-ia`, ingresa el código de acceso y
confirma que el dashboard carga datos reales (no debe haber errores de CORS en la
consola del navegador — si los hay, revisa que `CORS_ORIGIN` en Railway sea
exactamente `https://panel.talentix.com.do`, sin `www.` y sin slash final).

---

## 3. Autenticación (Supabase Auth)

El login ya no usa contraseñas propias con bcrypt — se migró a Supabase Auth,
con alta de usuarios **exclusivamente por invitación** (el CEO/RRHH escribe el
correo del talento desde el panel admin, Supabase le manda un correo, y desde
ahí la persona fija su propia contraseña). No hay registro público.

### 3.1 Variables de entorno — Railway (backend)

| Variable | Valor | Notas |
|---|---|---|
| `SUPABASE_URL` | `https://wutbiktticjoidvybago.supabase.co` | del dashboard de Supabase del proyecto |
| `SUPABASE_ANON_KEY` | la clave `anon` del proyecto | usada en cada request para verificar el JWT vía `getClaims()` — clave de menor privilegio |
| `SUPABASE_SERVICE_ROLE_KEY` | la clave `service_role` del proyecto | **solo** necesaria si el panel admin de creación de usuarios debe funcionar en producción (`AdminService.crearUsuario()` la usa para `inviteUserByEmail`). Nunca se usa para resolver sesiones de request normales |

### 3.2 Variables de entorno — Vercel (dashboard)

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | la misma URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la misma clave `anon` (segura de exponer en el cliente por diseño) |

Agrega ambas para **Production** y **Preview**. `SUPABASE_SERVICE_ROLE_KEY` **nunca**
va en el dashboard/frontend — solo en el backend (Railway) o como variable local/CI
para `scripts/migrar-usuarios-supabase.ts`.

### 3.3 Configuración a verificar en el dashboard de Supabase antes del cutover

No asumas los valores por defecto — verifica cada uno contra el proyecto real:

- **Authentication → URL Configuration**: `Site URL` = dominio real del dashboard
  (`https://panel.talentix.com.do`); agrega `https://panel.talentix.com.do/auth/confirm`
  a **Redirect URLs** (Supabase rechaza cualquier `redirectTo` que no esté en esa lista).
- **Authentication → Providers → Email**: considera deshabilitar el auto-registro
  público, ya que todos los usuarios se crean por invitación desde el panel admin.
- **Authentication → Multi-factor**: confirmar que TOTP esté habilitado (debería
  estarlo por defecto en el plan Free, pero verifica contra el proyecto real).
- **Email Templates → Invite user / Reset password**: personalizar el texto es
  opcional, pero requiere SMTP propio configurado (el servicio de correo por
  defecto del plan Free no deja editar la plantilla) — **no es necesario para
  que el flujo funcione**: `app/auth/confirm/page.tsx` ya maneja los dos
  formatos de link que Supabase puede generar (el de la plantilla por
  defecto, que pasa la sesión en el fragmento `#access_token=...` de la URL,
  y el de una plantilla personalizada apuntando a `?token_hash=...&type=...`).
  Si en algún momento se personaliza la plantilla, el link debe apuntar a
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite` (o
  `type=recovery` en la plantilla de reset) para usar el segundo formato.
- Si el envío de correos fue lento/inconsistente durante pruebas (el límite
  por hora del SMTP por defecto de Supabase en plan Free es bajo), considera
  configurar un proveedor SMTP propio en **Authentication → SMTP Settings**
  antes de invitar a muchos usuarios reales de una vez.

### 3.4 Runbook de despliegue (orden obligatorio, evita cortar el login en producción)

1. **Migración de schema aditiva primero**: `npx prisma migrate deploy` debe
   aplicar `20260717010000_supabase_auth_add_columns` (agrega `supabaseUserId`
   nullable y `passwordEstablecida` con default `false`) **sin** aplicar todavía
   `20260717020000_supabase_auth_cutover` (que es destructiva: borra
   `passwordHash`/`passwordDebeCambiar`/`Sesion` y vuelve `supabaseUserId`
   obligatorio). Si usas Release Command de Railway con `migrate deploy` sin
   más control, aplica ambas en el mismo deploy — para un rollout gradual real,
   despliega primero solo con la migración aditiva aplicada a mano
   (`prisma migrate resolve` o aplicando ese único archivo), deja el código
   viejo funcionando, y recién en el paso 3 aplicas la migración de corte.
2. Correr `scripts/migrar-usuarios-supabase.ts` contra producción (con
   `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL` de producción como variables
   locales, nunca commiteadas) — envía la invitación real a cada `Usuario`
   existente, incluyendo `eric.vizcaino@agil.com.do`, y les asigna su
   `supabaseUserId`.
3. **Cutover**: desplegar en un solo release el código de este commit (login
   nuevo + guards basados en Bearer + `proxy.ts` nuevo + `lib/api.ts` nuevo) y
   aplicar la migración destructiva `20260717020000_supabase_auth_cutover`.
   Confirmar primero en un usuario de prueba que el ciclo completo (invitación →
   activar cuenta → login → MFA si es CEO/RRHH → panel) funciona de punta a
   punta contra producción, no solo local.
4. Solo después de confirmar estabilidad, considerar el cutover cerrado — no hay
   vuelta atrás sencilla una vez aplicada la migración destructiva.

### 3.5 Antes de cualquier `git push` de esta fase

Confirmar explícitamente qué commits se van a subir con `git log origin/main..HEAD`
— no asumir que "el commit de arriba" es el único que sube. Esta migración de auth
ya se pusheó por accidente una vez junto con un fix no relacionado (ver historial de
commits `bd0bb91`/`b206933`); no repetir ese error.

### 3.6 Verificación post-deploy

- `GET /auth/me` con un token real (`curl -H "Authorization: Bearer <token>"`)
  antes y después del cutover, confirmando que devuelve `passwordEstablecida`
  correctamente.
- Confirmar que alguien con `passwordEstablecida = false` **no puede** saltarse
  `/activar-cuenta` navegando directo a otra URL del panel.
- Confirmar que ClawLink (`codigoAcceso`) sigue funcionando sin cambios:
  `curl "https://api.talentix.com.do/empresas/<slug>/dashboard?codigoAcceso=<codigo>"`
  debe seguir respondiendo 200.
- Confirmar que el correo de invitación/reset llega y su link resuelve
  correctamente contra el dominio real de producción, no solo localhost.

---

## 4. DNS — resumen de registros a crear

En el proveedor de DNS de `talentix.com.do`, crea:

| Tipo | Host | Apunta a | Para |
|---|---|---|---|
| CNAME | `panel` | el valor que te de Vercel (ej. `cname.vercel-dns.com`) | Dashboard |
| CNAME | `api` | el valor que te de Railway (ej. `xxxxx.up.railway.app`) | API |

Ambos paneles (Vercel y Railway) validan el dominio automáticamente unos minutos
después de propagado el DNS y emiten su propio certificado SSL — no necesitas
configurar HTTPS manualmente en ninguno de los dos.

---

## 5. Orden recomendado para el día del deploy

1. Desplegar la API en Railway (sección 1) y confirmar que responde en su dominio
   `*.up.railway.app` por defecto, **antes** de mover DNS.
2. Desplegar el dashboard en Vercel (sección 2) usando temporalmente la URL
   `*.up.railway.app` de Railway en `NEXT_PUBLIC_API_URL`, y confirmar que el panel
   funciona end-to-end con esa URL temporal.
3. Agregar los dominios personalizados en ambos (secciones 1.3 y 2.4).
4. Crear los registros DNS (sección 4).
5. Una vez el DNS propague y los dominios se verifiquen, actualizar
   `CORS_ORIGIN` (Railway) y `NEXT_PUBLIC_API_URL` (Vercel) a los dominios finales
   y volver a desplegar ambos servicios (un redeploy manual basta, no requiere
   cambios de código).

Este orden evita que el dashboard quede apuntando a una URL de API que todavía no
existe, y permite probar todo el flujo antes de tocar el DNS real.

---

## 6. Antes de anunciar el lanzamiento — checklist

- [ ] Confirmar que `ADMIN_TOKEN` y `CORS_ORIGIN` están configurados en Railway
      (sin ellos, `GET /empresas` queda bloqueado y el CORS usa el default de
      desarrollo).
- [ ] Confirmar que `SUPABASE_URL`/`SUPABASE_ANON_KEY` (Railway y Vercel) y
      `SUPABASE_SERVICE_ROLE_KEY` (solo Railway, solo si el panel admin debe
      poder invitar usuarios en producción) están configurados — ver sección 3.
- [ ] Considerar rotar los códigos de acceso de demo (`IAGIL-2026` y los de
      `Cliente Demo 1-4`) si la base de Neon de producción es la misma que se usó
      durante el desarrollo — esos códigos ya aparecieron en este chat y en
      capturas de pantalla.
- [ ] Decidir si las 4 empresas demo (`cliente-demo-1` a `4`) deben seguir
      existiendo en la base de producción o se eliminan antes del lanzamiento real
      con clientes.
- [ ] Verificar que `npm run build` pasa sin errores en ambos proyectos justo antes
      de cada deploy (ya verificado en este momento del desarrollo, pero conviene
      repetirlo si hay cambios posteriores).
- [ ] Confirmar que el Blob store de Vercel está creado y conectado al proyecto
      (`BLOB_READ_WRITE_TOKEN` presente en Production) — ver sección 2.3. Sin esto,
      ninguna subida de archivo (fotos, CVs, carnet, logo, estampas) funciona.
