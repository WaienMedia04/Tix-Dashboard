/**
 * Solo los IDs viven en el backend (para validar `colorNombreId`) — los
 * valores CSS reales del degradado viven en el frontend
 * (dashboard/lib/mural-colores-nombre.ts) para poder ajustar los colores
 * sin migración.
 */
export const COLORES_NOMBRE_MURAL_IDS = [
  'cian_magenta',
  'aurora',
  'atardecer',
  'oceano',
  'bosque',
  'fuego',
  'rosado',
  'dorado',
  'grafito',
] as const;

export type ColorNombreMuralId = (typeof COLORES_NOMBRE_MURAL_IDS)[number];
