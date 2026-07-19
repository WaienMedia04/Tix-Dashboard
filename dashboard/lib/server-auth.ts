import { API_URL } from "./api";

/**
 * Verifica, del lado del servidor (Route Handler), que el Bearer token
 * Supabase de la request pertenezca a un CEO o RRHH — son los únicos roles
 * que pueden subir fotos/CVs de talentos. Lanza si no está autorizado.
 */
export async function exigirRolAdministrativo(request: Request): Promise<void> {
  const authorization = request.headers.get("authorization") ?? "";
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { authorization },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Sesión inválida o expirada");
  }
  const sesion = (await res.json()) as { usuario: { rol: string } };
  if (sesion.usuario.rol !== "CEO" && sesion.usuario.rol !== "RRHH") {
    throw new Error("No autorizado");
  }
}

/**
 * Verifica, del lado del servidor (Route Handler), que el `x-admin-token`
 * de la request sea válido — delegando al propio backend (que ya lo
 * compara contra ADMIN_TOKEN vía AdminGuard) en vez de duplicar el
 * secreto en el servidor de Next. Usado por las subidas del panel
 * super-admin (ej. logo de empresa).
 */
export async function exigirTokenAdmin(request: Request): Promise<void> {
  const tokenAdmin = request.headers.get("x-admin-token") ?? "";
  const res = await fetch(`${API_URL}/admin/dashboard`, {
    headers: { "x-admin-token": tokenAdmin },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("No autorizado");
  }
}
