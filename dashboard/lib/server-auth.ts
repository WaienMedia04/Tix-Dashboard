import { API_URL } from "./api";

/**
 * Verifica, del lado del servidor (Route Handler), que la cookie de sesión
 * de la request pertenezca a un CEO o RRHH — son los únicos roles que
 * pueden subir fotos/CVs de talentos. Lanza si no está autorizado.
 */
export async function exigirRolAdministrativo(request: Request): Promise<void> {
  const cookie = request.headers.get("cookie") ?? "";
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { cookie },
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
