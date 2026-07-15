import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "tix_session";

// Chequeo optimista: solo mira si la cookie de sesión existe, sin
// decodificarla ni pegarle a la API — eso lo hace el layout del panel vía
// GET /auth/me, que sí puede determinar el rol y redirigir correctamente.
// (Ver node_modules/next/dist/docs/01-app/02-guides/authentication.md.)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const esPublica =
    pathname === "/" ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/admin");

  if (esPublica) {
    return NextResponse.next();
  }

  const tieneSesion = request.cookies.has(SESSION_COOKIE);
  if (!tieneSesion) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
