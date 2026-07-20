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
] as const;

export type FondoMuralId = (typeof FONDOS_MURAL_IDS)[number];
