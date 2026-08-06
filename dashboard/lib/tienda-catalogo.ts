/** IDs y clases deben coincidir exactamente con MARCOS/TITULOS en el backend (src/tienda/tienda.constant.ts). */

export interface MarcoTienda {
  id: string;
  nombre: string;
  /** Clases Tailwind del anillo/resplandor alrededor del carnet. */
  clases: string;
}

export const MARCOS_TIENDA: MarcoTienda[] = [
  { id: "dorado", nombre: "Dorado", clases: "ring-4 ring-amber-400" },
  { id: "esmeralda", nombre: "Esmeralda", clases: "ring-4 ring-emerald-400" },
  { id: "zafiro", nombre: "Zafiro", clases: "ring-4 ring-sky-400" },
  { id: "rosa", nombre: "Rosa", clases: "ring-4 ring-pink-400" },
  { id: "fuego", nombre: "Fuego", clases: "ring-4 ring-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.65)]" },
  { id: "electrico", nombre: "Eléctrico", clases: "ring-4 ring-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.65)]" },
  { id: "legendario", nombre: "Legendario", clases: "ring-4 ring-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.8)]" },
];

export interface TituloTienda {
  id: string;
  texto: string;
  /** Clave que resuelve el ícono en dashboard/lib/iconos-catalogo.ts. */
  icono: string;
}

export const TITULOS_TIENDA: TituloTienda[] = [
  { id: "crack", texto: "Crack", icono: "rocket" },
  { id: "madrugador", texto: "Madrugador", icono: "sunrise" },
  { id: "colaborador_estrella", texto: "Colaborador estrella", icono: "handshake" },
  { id: "imparable", texto: "Imparable", icono: "zap" },
  { id: "mentor", texto: "Mentor", icono: "graduation-cap" },
  { id: "leyenda", texto: "Leyenda del equipo", icono: "crown" },
];

export function clasesMarco(marcoId: string | null): string {
  if (!marcoId) return "";
  return MARCOS_TIENDA.find((m) => m.id === marcoId)?.clases ?? "";
}

export function textoTitulo(tituloId: string | null): string | null {
  if (!tituloId) return null;
  return TITULOS_TIENDA.find((t) => t.id === tituloId)?.texto ?? null;
}

export function iconoTitulo(tituloId: string | null): string | null {
  if (!tituloId) return null;
  return TITULOS_TIENDA.find((t) => t.id === tituloId)?.icono ?? null;
}

export interface BordeNotaTienda {
  id: string;
  nombre: string;
  /** Clases Tailwind del anillo/resplandor alrededor de la nota. */
  clases: string;
}

export const BORDES_NOTA_TIENDA: BordeNotaTienda[] = [
  { id: "electrico_nota", nombre: "Eléctrico", clases: "ring-4 ring-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.6)]" },
  { id: "dorado_nota", nombre: "Dorado", clases: "ring-4 ring-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.5)]" },
  { id: "esmeralda_nota", nombre: "Esmeralda", clases: "ring-4 ring-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.5)]" },
  { id: "zafiro_nota", nombre: "Zafiro", clases: "ring-4 ring-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.5)]" },
  { id: "fuego_nota", nombre: "Fuego", clases: "ring-4 ring-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.65)]" },
  { id: "rosa_neon_nota", nombre: "Rosa Neón", clases: "ring-4 ring-pink-500 shadow-[0_0_18px_rgba(236,72,153,0.65)]" },
  { id: "mistico_nota", nombre: "Místico", clases: "ring-4 ring-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.65)]" },
  {
    id: "obsidiana_legendaria_nota",
    nombre: "Obsidiana Legendaria",
    clases: "ring-4 ring-zinc-700 shadow-[0_0_20px_rgba(0,0,0,0.7)]",
  },
];

export function clasesBordeNota(bordeId: string | null): string {
  if (!bordeId) return "";
  return BORDES_NOTA_TIENDA.find((b) => b.id === bordeId)?.clases ?? "";
}
