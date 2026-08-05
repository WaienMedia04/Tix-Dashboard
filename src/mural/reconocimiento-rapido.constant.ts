import { TipoReconocimientoRapido } from '@prisma/client';

/**
 * Catálogo fijo del botón de reconocimiento rápido (doc "Actualización
 * Mural 2.0" #7) — el mismo orden se usa en el frontend. `icono` es una
 * clave que resuelve el ícono real en dashboard/lib/iconos-catalogo.ts.
 */
export const RECONOCIMIENTOS_RAPIDOS: Record<
  TipoReconocimientoRapido,
  { icono: string; etiqueta: string }
> = {
  GRACIAS: { icono: 'thumbs-up', etiqueta: 'Gracias' },
  EXCELENTE_TRABAJO: { icono: 'flame', etiqueta: 'Excelente trabajo' },
  CRACK: { icono: 'rocket', etiqueta: 'Crack' },
  INSPIRADOR: { icono: 'star', etiqueta: 'Inspirador' },
  BUENA_IDEA: { icono: 'lightbulb', etiqueta: 'Buena idea' },
  GRAN_COMPANERO: { icono: 'heart', etiqueta: 'Gran compañero' },
};
