import type { TipoReconocimientoRapido } from "@/lib/api";

/** Mismo catálogo y orden que src/mural/reconocimiento-rapido.constant.ts en el backend. */
export const CATALOGO_RECONOCIMIENTOS_RAPIDOS: { tipo: TipoReconocimientoRapido; emoji: string; etiqueta: string }[] = [
  { tipo: "GRACIAS", emoji: "👏", etiqueta: "Gracias" },
  { tipo: "EXCELENTE_TRABAJO", emoji: "🔥", etiqueta: "Excelente trabajo" },
  { tipo: "CRACK", emoji: "🚀", etiqueta: "Crack" },
  { tipo: "INSPIRADOR", emoji: "⭐", etiqueta: "Inspirador" },
  { tipo: "BUENA_IDEA", emoji: "💡", etiqueta: "Buena idea" },
  { tipo: "GRAN_COMPANERO", emoji: "❤️", etiqueta: "Gran compañero" },
];
