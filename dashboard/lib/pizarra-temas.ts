/** IDs deben coincidir con COLOR_WIDGETS_IDS en el backend (src/mural/mural-color-widgets.constant.ts). */
export type TemaWidgets = "vibrante" | "solido";

export interface EstiloWidget {
  /** Fondo + borde de la tarjeta. */
  card: string;
  /** Fondo del círculo detrás del ícono. */
  badge: string;
  /** Color del ícono. */
  icon: string;
}

/**
 * Cada widget de la Pizarra tiene un color de acento fijo (coincide con el
 * que ya tenía su ícono) — en tema "vibrante" se usa como fondo teñido de la
 * tarjeta; en "solido" todos caen al mismo gris plano de siempre.
 */
const COLORES: Record<string, EstiloWidget> = {
  naranja: { card: "border-orange-200 bg-orange-50", badge: "bg-orange-100", icon: "text-orange-600" },
  ambar: { card: "border-amber-200 bg-amber-50", badge: "bg-amber-100", icon: "text-amber-600" },
  rosa: { card: "border-rose-200 bg-rose-50", badge: "bg-rose-100", icon: "text-rose-600" },
  amarillo: { card: "border-yellow-200 bg-yellow-50", badge: "bg-yellow-100", icon: "text-yellow-600" },
  fucsia: { card: "border-fuchsia-200 bg-fuchsia-50", badge: "bg-fuchsia-100", icon: "text-fuchsia-600" },
  cielo: { card: "border-sky-200 bg-sky-50", badge: "bg-sky-100", icon: "text-sky-600" },
  rosado: { card: "border-pink-200 bg-pink-50", badge: "bg-pink-100", icon: "text-pink-600" },
  indigo: { card: "border-indigo-200 bg-indigo-50", badge: "bg-indigo-100", icon: "text-indigo-600" },
};

const SOLIDO: EstiloWidget = {
  card: "border-zinc-200 bg-zinc-50",
  badge: "bg-zinc-200",
  icon: "text-zinc-500",
};

export function estiloWidget(tema: TemaWidgets, colorKey: keyof typeof COLORES): EstiloWidget {
  return tema === "solido" ? SOLIDO : COLORES[colorKey];
}
