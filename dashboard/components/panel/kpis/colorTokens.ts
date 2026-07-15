import type { EstadoColorKey } from "@/lib/api";

// Recharts no puede leer variables CSS, así que estos valores quedan
// duplicados como literales — deben reflejar la paleta de marca de
// globals.css. Elegidos para leerse razonablemente en claro y oscuro
// (Recharts no es theme-aware todavía; eso llega con el rediseño de
// gráficas de la fase Dashboard).
export const COLOR_ESTADO: Record<EstadoColorKey, string> = {
  success: "#22c55e", /* verde — enviada */
  destructive: "#ef4444", /* rojo — no enviada */
  info: "#3b82f6", /* azul — permiso autorizado */
  warning: "#eab308", /* ámbar — pendiente */
  neutral: "#71717a", /* gris — estados admin */
  muted: "#a1a1aa", /* gris claro — sin datos */
};

export const COLOR_CHART_1 = "#a855f7"; /* violeta — acento insignia */
export const COLOR_CHART_2 = "#22d3ee"; /* cian — acento insignia claro */
export const COLOR_GRID = "rgba(113, 113, 122, 0.25)";
export const COLOR_TICK = "#71717a";
