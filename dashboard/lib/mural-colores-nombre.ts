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
  { id: "lavanda", label: "Lavanda", colors: ["#C4B5FD", "#818CF8", "#C4B5FD"] },
  { id: "menta", label: "Menta", colors: ["#6EE7B7", "#0D9488", "#6EE7B7"] },
  { id: "cereza", label: "Cereza", colors: ["#F43F5E", "#831843", "#F43F5E"] },
  { id: "zafiro", label: "Zafiro", colors: ["#38BDF8", "#1E3A8A", "#38BDF8"] },
  { id: "topacio", label: "Topacio", colors: ["#FCD34D", "#D97706", "#FCD34D"] },
  { id: "plata", label: "Plata", colors: ["#F4F4F5", "#A1A1AA", "#F4F4F5"] },
  { id: "esmeralda", label: "Esmeralda", colors: ["#34D399", "#047857", "#34D399"] },
  { id: "amatista", label: "Amatista", colors: ["#A78BFA", "#5B21B6", "#A78BFA"] },
  { id: "rubi", label: "Rubí", colors: ["#FB7185", "#9F1239", "#FB7185"] },
  { id: "neon_verde", label: "Neón Verde", colors: ["#A3E635", "#3F6212", "#A3E635"] },
  { id: "neon_rosa", label: "Neón Rosa", colors: ["#F472B6", "#BE185D", "#F472B6"] },
  { id: "oro_rosa", label: "Oro Rosa", colors: ["#FDA4AF", "#FB923C", "#FDA4AF"] },
  { id: "medianoche", label: "Medianoche", colors: ["#818CF8", "#312E81", "#818CF8"] },
  { id: "platino_real", label: "Platino Real", colors: ["#E4E4E7", "#FFFFFF", "#A1A1AA"] },
  {
    id: "arcoiris",
    label: "Arcoíris",
    colors: ["#F43F5E", "#F59E0B", "#22D3EE", "#8B5CF6", "#D946EF"],
  },
];

export function coloresNombreMural(colorNombreId: string): string[] {
  return COLORES_NOMBRE_MURAL.find((c) => c.id === colorNombreId)?.colors ?? COLORES_NOMBRE_MURAL[0].colors;
}
