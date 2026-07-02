import type { EstadoColorKey } from "@/lib/api";

export const COLOR_ESTADO: Record<EstadoColorKey, string> = {
  success: "oklch(0.6 0.15 155)",       /* verde — enviada (semántico, no de marca) */
  destructive: "oklch(0.55 0.22 27)",   /* rojo — no enviada */
  info: "oklch(0.53 0.09 236)",         /* azul acero — permiso autorizado */
  warning: "oklch(0.75 0.15 70)",       /* ámbar — pendiente */
  neutral: "oklch(0.55 0.015 240)",     /* gris azulado — estados admin */
  muted: "oklch(0.50 0.025 240)",       /* gris azulado — sin datos */
};

export const COLOR_CHART_1 = "oklch(0.30 0.10 252)";  /* azul marino #0F3A5F */
export const COLOR_CHART_2 = "oklch(0.93 0.022 240)"; /* azul muy tenue — label/relleno claro */
export const COLOR_GRID = "oklch(0.90 0.012 240)";
export const COLOR_TICK = "oklch(0.50 0.025 240)";
