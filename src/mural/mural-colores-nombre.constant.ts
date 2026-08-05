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
  'lavanda',
  'menta',
  'cereza',
  'zafiro',
  'topacio',
  'plata',
  'esmeralda',
  'amatista',
  'rubi',
  'neon_verde',
  'neon_rosa',
  'oro_rosa',
  'medianoche',
  'platino_real',
  'arcoiris',
] as const;

export type ColorNombreMuralId = (typeof COLORES_NOMBRE_MURAL_IDS)[number];

/** Los 9 colores originales, siempre gratis. El resto se compra en la Tienda (src/tienda/tienda.constant.ts). */
export const COLORES_NOMBRE_MURAL_IDS_GRATIS = [
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
