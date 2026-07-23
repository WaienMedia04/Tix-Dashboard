/** IDs deben coincidir exactamente con TEMAS_WIDGETS en el frontend (dashboard/lib/pizarra-temas.ts). */
export const COLOR_WIDGETS_IDS = ['vibrante', 'solido'] as const;

export type ColorWidgetsId = (typeof COLOR_WIDGETS_IDS)[number];
