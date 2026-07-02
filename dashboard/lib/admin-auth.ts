const KEY = "talentix_admin_token";

export function leerTokenAdmin(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(KEY);
}

export function guardarTokenAdmin(token: string): void {
  sessionStorage.setItem(KEY, token);
}

export function borrarTokenAdmin(): void {
  sessionStorage.removeItem(KEY);
}
