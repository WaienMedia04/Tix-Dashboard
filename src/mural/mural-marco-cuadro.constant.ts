/**
 * Solo los IDs viven acá (para validar `cuadroMarcoId`) — el precio, la
 * rareza y la descripción de los pagos viven en src/tienda/tienda.constant.ts
 * (MARCOS_CUADRO) y las clases CSS reales en dashboard/lib/mural-marco-cuadro.ts,
 * igual que el resto de catálogos de la Tienda. A diferencia de marcoId (el
 * marco del carnet), cuadroMarcoId decora la foto enmarcada cuando
 * modoEncabezado es "cuadro".
 */
export const MARCOS_CUADRO_IDS = [
  'clasico',
  'madera',
  'moderno',
  'minimalista',
  'neon_pulsante',
  'dorado_real',
  'arcoiris_fluido',
  'cristal',
] as const;

export type MarcoCuadroId = (typeof MARCOS_CUADRO_IDS)[number];

/** Los 4 marcos que vienen de fábrica, siempre gratis. El resto se compra en la Tienda. */
export const MARCOS_CUADRO_IDS_GRATIS = [
  'clasico',
  'madera',
  'moderno',
  'minimalista',
] as const;
