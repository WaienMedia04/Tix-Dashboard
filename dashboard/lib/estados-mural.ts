export interface EstadoMuralPreset {
  texto: string;
  color: string;
}

/** Estados sugeridos con un color que los representa — el talento también puede escribir uno libre. */
export const ESTADOS_MURAL_PRESETS: EstadoMuralPreset[] = [
  { texto: "Trabajando", color: "#f59e0b" },
  { texto: "Concentrado", color: "#8b5cf6" },
  { texto: "Disponible", color: "#22c55e" },
  { texto: "En reunión", color: "#3b82f6" },
  { texto: "Descansando", color: "#06b6d4" },
  { texto: "Programando con música", color: "#ec4899" },
];

const COLOR_ESTADO_LIBRE = "#a1a1aa";

/** Color del preset si el estado coincide con uno conocido; gris neutro para texto libre. */
export function colorParaEstado(estado: string): string {
  const preset = ESTADOS_MURAL_PRESETS.find((e) => e.texto.toLowerCase() === estado.trim().toLowerCase());
  return preset?.color ?? COLOR_ESTADO_LIBRE;
}
