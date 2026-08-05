import type { TipoReconocimientoRapido } from "@/lib/api";

/**
 * Mismo catálogo y orden que src/mural/reconocimiento-rapido.constant.ts en
 * el backend. `icono` es una clave que resuelve el ícono real en
 * dashboard/lib/iconos-catalogo.ts.
 */
export const CATALOGO_RECONOCIMIENTOS_RAPIDOS: { tipo: TipoReconocimientoRapido; icono: string; etiqueta: string }[] = [
  { tipo: "GRACIAS", icono: "thumbs-up", etiqueta: "Gracias" },
  { tipo: "EXCELENTE_TRABAJO", icono: "flame", etiqueta: "Excelente trabajo" },
  { tipo: "CRACK", icono: "rocket", etiqueta: "Crack" },
  { tipo: "INSPIRADOR", icono: "star", etiqueta: "Inspirador" },
  { tipo: "BUENA_IDEA", icono: "lightbulb", etiqueta: "Buena idea" },
  { tipo: "GRAN_COMPANERO", icono: "heart", etiqueta: "Gran compañero" },
];
