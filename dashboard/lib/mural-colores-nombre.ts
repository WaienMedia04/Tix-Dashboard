/** IDs deben coincidir exactamente con COLORES_NOMBRE_MURAL_IDS en el backend (src/mural/mural-colores-nombre.constant.ts). */
export interface ColorNombreMural {
  id: string;
  label: string;
  /** Colores del degradado animado (GradientText) — al menos 2. */
  colors: string[];
}

export const COLORES_NOMBRE_MURAL: ColorNombreMural[] = [
  { id: "cian_magenta", label: "Cian y magenta", colors: ["#00F2FF", "#BC00FF", "#00F2FF"] },
  { id: "aurora", label: "Aurora", colors: ["#22D3EE", "#8B5CF6", "#D946EF"] },
  { id: "atardecer", label: "Atardecer", colors: ["#FB923C", "#F43F5E", "#A21CAF"] },
  { id: "oceano", label: "Océano", colors: ["#0EA5E9", "#06B6D4", "#0D9488"] },
  { id: "bosque", label: "Bosque", colors: ["#16A34A", "#65A30D", "#CA8A04"] },
  { id: "fuego", label: "Fuego", colors: ["#F59E0B", "#EF4444", "#7C2D12"] },
  { id: "rosado", label: "Rosado vibrante", colors: ["#F472B6", "#E11D48", "#F472B6"] },
  { id: "dorado", label: "Dorado", colors: ["#FDE68A", "#FBBF24", "#B45309"] },
  { id: "grafito", label: "Grafito", colors: ["#D4D4D8", "#A1A1AA", "#71717A"] },
];

export function coloresNombreMural(colorNombreId: string): string[] {
  return COLORES_NOMBRE_MURAL.find((c) => c.id === colorNombreId)?.colors ?? COLORES_NOMBRE_MURAL[0].colors;
}
