/** IDs deben coincidir exactamente con MARCOS_CUADRO_IDS en el backend (src/mural/mural-marco-cuadro.constant.ts). */
export interface MarcoCuadro {
  id: string;
  label: string;
  /** Grosor del marco — se aplica como padding del contenedor que envuelve la foto, así el marco queda pegado a los bordes de la foto, no del container. */
  grosor: string;
  /** Clases Tailwind (fondo/animación/sombra) del contenedor — la foto va adentro, más chica, dejando ver el fondo como marco. */
  clases: string;
}

export const MARCOS_CUADRO: MarcoCuadro[] = [
  { id: "clasico", label: "Clásico", grosor: "0.6rem", clases: "bg-white shadow-xl" },
  {
    id: "madera",
    label: "Madera",
    grosor: "0.75rem",
    clases: "bg-gradient-to-br from-amber-700 to-amber-900 shadow-xl",
  },
  { id: "moderno", label: "Moderno", grosor: "0.4rem", clases: "bg-zinc-900 shadow-2xl" },
  { id: "minimalista", label: "Minimalista", grosor: "0.2rem", clases: "bg-white/80 shadow-md" },
  {
    id: "neon_pulsante",
    label: "Neón Pulsante",
    grosor: "0.5rem",
    clases: "marco-cuadro-neon shadow-[0_0_24px_rgba(217,70,239,0.6)]",
  },
  {
    id: "dorado_real",
    label: "Dorado Real",
    grosor: "0.75rem",
    clases: "marco-cuadro-dorado shadow-[0_0_24px_rgba(252,211,77,0.6)]",
  },
  {
    id: "arcoiris_fluido",
    label: "Arcoíris Fluido",
    grosor: "0.6rem",
    clases: "franja-degradado-talentix shadow-xl",
  },
  { id: "cristal", label: "Cristal", grosor: "0.5rem", clases: "marco-cuadro-cristal" },
];

export function marcoCuadroPorId(id: string | null): MarcoCuadro | null {
  if (!id) return null;
  return MARCOS_CUADRO.find((m) => m.id === id) ?? null;
}
