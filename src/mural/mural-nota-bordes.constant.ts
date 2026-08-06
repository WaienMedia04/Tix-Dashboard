/**
 * Solo los IDs viven acá (para validar `bordeId` en las notas) — el precio,
 * la rareza y la descripción viven en src/tienda/tienda.constant.ts (BORDES_NOTA)
 * y las clases Tailwind del anillo/resplandor en dashboard/lib/tienda-catalogo.ts,
 * igual que el resto de ítems de la Tienda. A diferencia de fondo/mascota/color de
 * nombre, un borde de nota NO se "equipa" en el perfil — se compra una vez y
 * después se elige por nota individual (MuralNotaAdhesiva.bordeId), así que
 * todos los ids de acá son de pago, sin subconjunto gratis.
 */
export const BORDES_NOTA_IDS = [
  'electrico_nota',
  'dorado_nota',
  'esmeralda_nota',
  'zafiro_nota',
  'fuego_nota',
  'rosa_neon_nota',
  'mistico_nota',
  'obsidiana_legendaria_nota',
] as const;

export type BordeNotaId = (typeof BORDES_NOTA_IDS)[number];
