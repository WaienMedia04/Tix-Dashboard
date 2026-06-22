const storageKey = (slug: string) => `talentix_codigo_${slug}`;

export function leerCodigoGuardado(slug: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(storageKey(slug));
}

export function guardarCodigo(slug: string, codigo: string): void {
  sessionStorage.setItem(storageKey(slug), codigo);
}

export function borrarCodigo(slug: string): void {
  sessionStorage.removeItem(storageKey(slug));
}
