/** Qué se muestra en el centro del encabezado del mural. */
export const MODOS_ENCABEZADO_MURAL_IDS = ['lanyard', 'cuadro'] as const;
export type ModoEncabezadoMuralId = (typeof MODOS_ENCABEZADO_MURAL_IDS)[number];

/** Tamaño del cuadro de foto cuando modoEncabezado es "cuadro". */
export const TAMANOS_CUADRO_MURAL_IDS = [
  'pequeno',
  'mediano',
  'grande',
] as const;
export type TamanoCuadroMuralId = (typeof TAMANOS_CUADRO_MURAL_IDS)[number];
