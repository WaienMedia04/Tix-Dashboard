import { TipoReconocimientoRapido } from '@prisma/client';

/** Catálogo fijo del botón de reconocimiento rápido (doc "Actualización Mural 2.0" #7) — el mismo orden se usa en el frontend. */
export const RECONOCIMIENTOS_RAPIDOS: Record<
  TipoReconocimientoRapido,
  { emoji: string; etiqueta: string }
> = {
  GRACIAS: { emoji: '👏', etiqueta: 'Gracias' },
  EXCELENTE_TRABAJO: { emoji: '🔥', etiqueta: 'Excelente trabajo' },
  CRACK: { emoji: '🚀', etiqueta: 'Crack' },
  INSPIRADOR: { emoji: '⭐', etiqueta: 'Inspirador' },
  BUENA_IDEA: { emoji: '💡', etiqueta: 'Buena idea' },
  GRAN_COMPANERO: { emoji: '❤️', etiqueta: 'Gran compañero' },
};
