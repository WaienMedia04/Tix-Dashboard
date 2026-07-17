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
| `DATABASE_URL` | connection string de Neon, **host con `-pooler`** | la misma que usas en local, en `.env` |
| `CORS_ORIGIN` | `https://panel.talentix.com.do` | dominio exacto del dashboard en producción (sin slash final) |
| `ADMIN_TOKEN` | un valor aleatorio largo | genera uno con `openssl rand -hex 32`. Protege `GET /empresas` |
| `MISTRAL_API_KEY` | tu API key de [console.mistral.ai](https://console.mistral.ai) | extracción de datos de CVs por IA. Sin esta variable, la subida de CV se guarda igual pero `cvDatosExtraidos` queda en `null` |
| `CLERK_SECRET_KEY` | tu Secret Key de [Clerk Dashboard → API Keys](https://dashboard.clerk.com) | autenticación de usuarios (login, MFA). El backend la usa para verificar el JWT de sesión de cada request (`verifyToken`) y para crear usuarios/invitaciones desde el panel admin |

`PORT` no hace falta configurarlo: Railway lo inyecta automáticamente y el código ya
usa `process.env.PORT ?? 3000`.

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
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | tu Publishable Key de Clerk Dashboard → API Keys (misma cuenta que `CLERK_SECRET_KEY` en Railway) |
| `CLERK_SECRET_KEY` | la misma Secret Key que en Railway — la usan las rutas server-side de Next.js (`proxy.ts`, componentes server) |

Agrégalas para los entornos **Production** y **Preview**. Sin `NEXT_PUBLIC_API_URL` el
dashboard intentará hablar con `http://localhost:3000` y todo fallará en
producción; sin las variables de Clerk, el login no carga en absoluto.

### 2.3 Dominio personalizado del dashboard

1. En **Settings → Domains**, agrega `panel.talentix.com.do`.
2. Vercel te mostrará el registro a crear en tu DNS — normalmente un **CNAME** a
   `cname.vercel-dns.com` (Vercel confirma el valor exacto en pantalla; si el
   subdominio fuera el dominio raíz pediría un registro `A`, pero `panel.` es un
   subdominio así que será CNAME).

### 2.4 Verificación

Visita `https://panel.talentix.com.do/iagil-bots-ia`, ingresa el código de acceso y
confirma que el dashboard carga datos reales (no debe haber errores de CORS en la
consola del navegador — si los hay, revisa que `CORS_ORIGIN` en Railway sea
exactamente `https://panel.talentix.com.do`, sin `www.` y sin slash final).

---

## 3. DNS — resumen de registros a crear

En el proveedor de DNS de `talentix.com.do`, crea:

| Tipo | Host | Apunta a | Para |
|---|---|---|---|
| CNAME | `panel` | el valor que te de Vercel (ej. `cname.vercel-dns.com`) | Dashboard |
| CNAME | `api` | el valor que te de Railway (ej. `xxxxx.up.railway.app`) | API |

Ambos paneles (Vercel y Railway) validan el dominio automáticamente unos minutos
después de propagado el DNS y emiten su propio certificado SSL — no necesitas
configurar HTTPS manualmente en ninguno de los dos.

---

## 4. Orden recomendado para el día del deploy

1. Desplegar la API en Railway (sección 1) y confirmar que responde en su dominio
   `*.up.railway.app` por defecto, **antes** de mover DNS.
2. Desplegar el dashboard en Vercel (sección 2) usando temporalmente la URL
   `*.up.railway.app` de Railway en `NEXT_PUBLIC_API_URL`, y confirmar que el panel
   funciona end-to-end con esa URL temporal.
3. Agregar los dominios personalizados en ambos (secciones 1.3 y 2.3).
4. Crear los registros DNS (sección 3).
5. Una vez el DNS propague y los dominios se verifiquen, actualizar
   `CORS_ORIGIN` (Railway) y `NEXT_PUBLIC_API_URL` (Vercel) a los dominios finales
   y volver a desplegar ambos servicios (un redeploy manual basta, no requiere
   cambios de código).

Este orden evita que el dashboard quede apuntando a una URL de API que todavía no
existe, y permite probar todo el flujo antes de tocar el DNS real.

---

## 5. Migración de autenticación a Clerk (usuarios existentes)

El login ahora lo maneja [Clerk](https://clerk.com) en vez de contraseñas propias
(`bcrypt`/`Sesion`). Si ya hay usuarios reales creados con el sistema anterior,
sigue este orden — **no lo saltes ni lo comprimas en un solo deploy**, o el login
se interrumpe para todo el mundo a mitad de camino:

1. Configura el proyecto de Clerk (si no lo has hecho) — **estos 4 puntos ya se
   verificaron a mano contra el proyecto real y son necesarios, no opcionales**:
   - **Configure → User & authentication → Email, Phone, Username**: pon
     "Username" y "Phone number" en **Off/Not required** (deja solo "Email
     address" y "Password"). Sin esto, crear un usuario desde el panel admin
     falla con error 422 "missing data" — Clerk los exige por defecto aunque
     esta app es solo correo + contraseña.
   - **Configure → Organizations**: déjalo **desactivado por completo**. Si
     queda activo, cada login se queda atascado indefinidamente (pending task
     "choose-organization") sin mensaje de error — esta app no usa
     Organizations de Clerk, las empresas se manejan en Neon.
   - **Configure → User & authentication → Multi-factor**: la verificación en
     dos pasos (TOTP/app autenticadora) requiere el **plan Pro de Clerk** — en
     el plan gratuito el toggle aparece con una insignia "Pro" y no se puede
     activar. Mientras no se actualice el plan, el enforcement de 2FA
     obligatorio para CEO/RRHH queda deshabilitado en el código (comentario
     explícito en `dashboard/app/page.tsx`) — no rompe nada, simplemente nadie
     pasa por el paso de activarlo todavía. Si actualizas el plan: activa el
     toggle de "Authenticator application" aquí, y **deja en OFF** el toggle
     separado "Require multi-factor authentication" (ese es una función
     todo-o-nada de Clerk que entra en conflicto con nuestro enforcement
     condicional por rol).
   - Verifica el dominio `panel.talentix.com.do` en modo producción antes del
     cutover real (Clerk lo exige para que las invitaciones/emails salgan desde
     el dominio correcto).
2. Agrega `CLERK_SECRET_KEY` (Railway) y `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` +
   `CLERK_SECRET_KEY` (Vercel) como se indica en las secciones 1.2 y 2.2, y
   despliega — en este punto el código ya corre con Clerk pero los usuarios
   viejos todavía no están enlazados (`Usuario.clerkUserId`).
3. Corre el script de migración **una sola vez**, contra producción:
   ```bash
   CLERK_SECRET_KEY=... DATABASE_URL=... npm run migrar:usuarios-clerk
   ```
   Envía una invitación por correo a cada usuario sin enlazar todavía. Cuando una
   persona completa la invitación (fija su contraseña en Clerk), vuelve a correr
   el mismo comando — es idempotente — para enlazar su `clerkUserId`.
4. Confirma en staging (o con un usuario de prueba) que el ciclo completo
   funciona: invitación → fijar contraseña → login → entrar al panel — **antes**
   de anunciar el cambio a los usuarios reales. Un login desde un dispositivo
   nuevo pedirá un código de confirmación por correo (protección nativa de
   Clerk, no algo que agregamos nosotros) — es normal.
5. Prueba explícitamente que ClawLink (`codigoAcceso`) sigue funcionando sin
   cambios — es tráfico de producción real que no debe verse afectado por nada de
   esto.

---

## 6. Antes de anunciar el lanzamiento — checklist

- [ ] Confirmar que `ADMIN_TOKEN` y `CORS_ORIGIN` están configurados en Railway
      (sin ellos, `GET /empresas` queda bloqueado y el CORS usa el default de
      desarrollo).
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
