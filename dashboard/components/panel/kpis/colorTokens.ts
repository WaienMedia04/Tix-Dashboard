import type { EstadoColorKey } from "@/lib/api";

export const COLOR_ESTADO: Record<EstadoColorKey, string> = {
  success: "oklch(0.6 0.15 155)",
  destructive: "oklch(0.55 0.22 27)",
  info: "oklch(0.55 0.13 230)",
  warning: "oklch(0.75 0.15 70)",
  neutral: "oklch(0.55 0.015 160)",
  muted: "oklch(0.55 0.02 155)",
};

export const COLOR_CHART_1 = "oklch(0.55 0.13 158)";
export const COLOR_CHART_2 = "oklch(0.88 0.02 150)";
export const COLOR_GRID = "oklch(0.9 0.012 150)";
export const COLOR_TICK = "oklch(0.55 0.02 155)";
