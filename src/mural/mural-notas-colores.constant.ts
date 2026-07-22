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

/** Acepta un id de la paleta fija o un color libre en hexadecimal (#rrggbb). */
export const PATRON_COLOR_NOTA = new RegExp(
  `^(#[0-9a-fA-F]{6}|${COLORES_NOTA_MURAL.join('|')})$`,
);
