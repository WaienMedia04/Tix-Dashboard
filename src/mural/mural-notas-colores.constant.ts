export const COLORES_NOTA_MURAL = [
  'amarillo',
  'rosa',
  'celeste',
  'verde',
  'lila',
  'naranja',
  'menta',
  'gris',
  'blanco',
] as const;

export type ColorNotaMural = (typeof COLORES_NOTA_MURAL)[number];
