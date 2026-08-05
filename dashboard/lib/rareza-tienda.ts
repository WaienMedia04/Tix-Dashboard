import type { RarezaItemTienda } from "@/lib/api";

export interface EstiloRareza {
  etiqueta: string;
  /** Orden de despliegue: legendario primero. */
  orden: number;
  texto: string;
  borde: string;
  fondoInsignia: string;
  resplandor: string;
}

export const ESTILO_RAREZA: Record<RarezaItemTienda, EstiloRareza> = {
  legendario: {
    etiqueta: "Legendario",
    orden: 0,
    texto: "text-amber-300",
    borde: "border-amber-300/40",
    fondoInsignia: "bg-gradient-to-r from-amber-400/25 to-amber-200/10 text-amber-200",
    resplandor: "shadow-[0_0_28px_-6px_rgba(252,211,77,0.55)]",
  },
  epico: {
    etiqueta: "Épico",
    orden: 1,
    texto: "text-violet-300",
    borde: "border-violet-400/35",
    fondoInsignia: "bg-gradient-to-r from-violet-500/25 to-fuchsia-500/10 text-violet-200",
    resplandor: "shadow-[0_0_24px_-8px_rgba(167,139,250,0.5)]",
  },
  raro: {
    etiqueta: "Raro",
    orden: 2,
    texto: "text-sky-300",
    borde: "border-sky-400/30",
    fondoInsignia: "bg-gradient-to-r from-sky-500/20 to-cyan-400/10 text-sky-200",
    resplandor: "shadow-[0_0_18px_-8px_rgba(56,189,248,0.45)]",
  },
  comun: {
    etiqueta: "Común",
    orden: 3,
    texto: "text-zinc-400",
    borde: "border-white/10",
    fondoInsignia: "bg-white/10 text-zinc-300",
    resplandor: "",
  },
};

export function ordenarPorRareza<T extends { rareza: RarezaItemTienda; precio: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const diff = ESTILO_RAREZA[a.rareza].orden - ESTILO_RAREZA[b.rareza].orden;
    return diff !== 0 ? diff : a.precio - b.precio;
  });
}
