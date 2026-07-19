/** Extrae un mensaje legible de un error desconocido, con un fallback si no hay nada útil. */
export function mensajeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return `${fallback} (${error.message})`;
  return fallback;
}
