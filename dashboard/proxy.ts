import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Chequeo optimista (ver node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md:
// "Proxy ... should not be used as a full session management or authorization
// solution"): valida que la sesión de Supabase sea real (firma/expiración,
// verificado localmente vía JWKS cacheado), pero NO consulta passwordEstablecida
// contra nuestro backend — eso lo hace el layout del panel vía GET /auth/me
// (que sí puede redirigir a /activar-cuenta), y todos los endpoints protegidos
// lo exigen igualmente en los guards, así que no hay hueco de seguridad real.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const esPublica =
    pathname === "/" ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth/confirm") ||
    pathname.startsWith("/activar-cuenta");

  if (esPublica) {
    return NextResponse.next();
  }

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            respuesta.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return respuesta;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
