export const COLORES_NOTA_MURAL = [
  'amarillo',
  'rosa',
  'celeste',
  'verde',
  'lila',
] as const;

export type ColorNotaMural = (typeof COLORES_NOTA_MURAL)[number];
