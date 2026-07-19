/** IDs deben coincidir exactamente con FONDOS_MURAL_IDS en el backend (src/mural/mural-fondos.constant.ts). */
export interface FondoMural {
  id: string;
  label: string;
  css: string;
}

export const FONDOS_MURAL: FondoMural[] = [
  { id: "aurora", label: "Aurora", css: "linear-gradient(135deg, #22D3EE 0%, #8B5CF6 55%, #D946EF 100%)" },
  { id: "atardecer", label: "Atardecer", css: "linear-gradient(135deg, #FB923C 0%, #F43F5E 60%, #A21CAF 100%)" },
  { id: "oceano", label: "Océano", css: "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #0D9488 100%)" },
  { id: "bosque", label: "Bosque", css: "linear-gradient(135deg, #16A34A 0%, #65A30D 55%, #CA8A04 100%)" },
  { id: "medianoche", label: "Medianoche", css: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)" },
  { id: "algodon", label: "Algodón de azúcar", css: "linear-gradient(135deg, #FBCFE8 0%, #DDD6FE 55%, #BFDBFE 100%)" },
  { id: "coral", label: "Coral", css: "linear-gradient(135deg, #FB7185 0%, #FB923C 100%)" },
  { id: "lavanda", label: "Lavanda", css: "linear-gradient(135deg, #C4B5FD 0%, #818CF8 100%)" },
  { id: "grafito", label: "Grafito", css: "linear-gradient(135deg, #3F3F46 0%, #18181B 100%)" },
  { id: "blanco", label: "Blanco", css: "#FAFAFA" },
];

export function fondoMuralCss(fondoId: string): string {
  return FONDOS_MURAL.find((f) => f.id === fondoId)?.css ?? FONDOS_MURAL[0].css;
}

/** Colores de notas adhesivas — deben coincidir con COLORES_NOTA_MURAL en el backend. */
export const COLORES_NOTA: { id: string; label: string; bg: string; texto: string }[] = [
  { id: "amarillo", label: "Amarillo", bg: "#FDE68A", texto: "#78350F" },
  { id: "rosa", label: "Rosa", bg: "#FBCFE8", texto: "#831843" },
  { id: "celeste", label: "Celeste", bg: "#BAE6FD", texto: "#0C4A6E" },
  { id: "verde", label: "Verde", bg: "#BBF7D0", texto: "#14532D" },
  { id: "lila", label: "Lila", bg: "#DDD6FE", texto: "#4C1D95" },
];

export function colorNotaEstilo(colorId: string): { bg: string; texto: string } {
  return COLORES_NOTA.find((c) => c.id === colorId) ?? COLORES_NOTA[0];
}
