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
