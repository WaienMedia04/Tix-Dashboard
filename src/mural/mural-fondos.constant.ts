/**
 * Solo los IDs viven en el backend (para validar `fondoId`) — los valores
 * CSS reales del degradado/color viven en el frontend
 * (dashboard/lib/mural-fondos.ts) para poder ajustar swatches sin migración.
 */
export const FONDOS_MURAL_IDS = [
  'corcho',
  'aurora',
  'atardecer',
  'oceano',
  'bosque',
  'medianoche',
  'algodon',
  'coral',
  'lavanda',
  'grafito',
  'blanco',
  'fuego',
  'menta',
  'rosado',
  'cielo',
  'vino',
  'dorado',
  'lluvia_llovizna',
  'lluvia_normal',
  'lluvia_tormenta',
  'nebulosa',
  'obsidiana_real',
  'esmeralda_imperial',
  'cobre_ardiente',
  'oceano_profundo',
  'galaxia',
  'aurora_boreal',
  'lava_fluida',
  'cristal_arcoiris',
  'cinta_ambiental',
  'lluvia_digital',
  'onda_hexagonal',
  'lineas_liquidas',
  'rieles_neon',
  'estela_estelar',
] as const;

export type FondoMuralId = (typeof FONDOS_MURAL_IDS)[number];

/**
 * Los únicos fondos que se pueden poner sin pasar por la Tienda: los 17
 * colores/degradados simples más "lluvia_llovizna" (el único especial que se
 * deja gratis). Todo lo demás (incluida la lluvia normal/tormenta y los 5
 * fondos animados nuevos) hay que comprarlo y equiparlo vía TiendaService.
 */
export const FONDOS_MURAL_IDS_GRATIS = [
  'corcho',
  'aurora',
  'atardecer',
  'oceano',
  'bosque',
  'medianoche',
  'algodon',
  'coral',
  'lavanda',
  'grafito',
  'blanco',
  'fuego',
  'menta',
  'rosado',
  'cielo',
  'vino',
  'dorado',
  'lluvia_llovizna',
] as const;
