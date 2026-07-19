import type { TipoEstampaForma } from "./api";

/** Clases Tailwind para recortar una imagen de estampa según su forma elegida. */
export function claseFormaEstampa(forma: TipoEstampaForma): string {
  switch (forma) {
    case "CIRCULAR":
      return "rounded-full";
    case "CUADRADO":
      return "rounded-sm";
    case "DIAMANTE":
      return "forma-diamante";
    case "LIBRE":
      return "";
    case "REDONDEADO":
    default:
      return "rounded-xl";
  }
}

export const FORMAS_ESTAMPA: { value: TipoEstampaForma; label: string }[] = [
  { value: "REDONDEADO", label: "Redondeado" },
  { value: "CIRCULAR", label: "Circular" },
  { value: "CUADRADO", label: "Cuadrado" },
  { value: "DIAMANTE", label: "Diamante" },
  { value: "LIBRE", label: "Libre (sin borde)" },
];
