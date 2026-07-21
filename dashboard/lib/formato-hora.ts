/**
 * Convierte una hora "HH:MM" (24h, como la guarda el backend) a formato de
 * 12 horas con a. m./p. m., ej. "14:05" → "2:05 p. m.". Puramente por texto
 * (sin Date/timezone) porque la entrada ya es una hora local sin fecha.
 */
export function formatearHora12(hora: string | null | undefined): string | null {
  if (!hora) return null;
  const coincidencia = /^(\d{1,2}):(\d{2})/.exec(hora);
  if (!coincidencia) return hora;

  const horas24 = Number(coincidencia[1]);
  const minutos = coincidencia[2];
  const sufijo = horas24 >= 12 ? "p. m." : "a. m.";
  const horas12 = horas24 % 12 || 12;

  return `${horas12}:${minutos} ${sufijo}`;
}
