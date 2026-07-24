/** IDs deben coincidir exactamente con MASCOTAS_MURAL en el frontend (dashboard/lib/mural-mascotas.ts) y con los subpaths del paquete clippyjs. */
export const MASCOTA_IDS = [
  'clippy',
  'bonzi',
  'f1',
  'genie',
  'genius',
  'links',
  'merlin',
  'peedy',
  'rocky',
  'rover',
] as const;

export type MascotaId = (typeof MASCOTA_IDS)[number];
