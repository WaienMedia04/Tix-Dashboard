const KEY = "talentix_admin_token";

/**
 * localStorage (no sessionStorage) — la sesión de admin debe sobrevivir a
 * cerrar la pestaña/ventana, igual que la sesión de empresa (que Supabase ya
 * persiste vía cookie de larga duración).
 */
export function leerTokenAdmin(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function guardarTokenAdmin(token: string): void {
  localStorage.setItem(KEY, token);
}

export function borrarTokenAdmin(): void {
  localStorage.removeItem(KEY);
}
