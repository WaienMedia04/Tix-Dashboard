export type RarezaItemTienda = 'comun' | 'raro' | 'epico' | 'legendario';

export interface ItemMarco {
  id: string;
  nombre: string;
  precio: number;
  rareza: RarezaItemTienda;
  /** Clases Tailwind del anillo/resplandor alrededor del carnet — mismo id que dashboard/lib/tienda-catalogo.ts. */
  clases: string;
}

export interface ItemTitulo {
  id: string;
  texto: string;
  precio: number;
  rareza: RarezaItemTienda;
}

export interface ItemFondo {
  id: string;
  nombre: string;
  precio: number;
  rareza: RarezaItemTienda;
}

/** Catálogo de marcos (doc "Actualización Mural 2.0" #4 y #20) — decoran el carnet del mural. */
export const MARCOS: ItemMarco[] = [
  { id: 'dorado', nombre: 'Dorado', precio: 200, rareza: 'raro', clases: 'ring-4 ring-amber-400' },
  { id: 'esmeralda', nombre: 'Esmeralda', precio: 200, rareza: 'raro', clases: 'ring-4 ring-emerald-400' },
  { id: 'zafiro', nombre: 'Zafiro', precio: 200, rareza: 'raro', clases: 'ring-4 ring-sky-400' },
  { id: 'rosa', nombre: 'Rosa', precio: 200, rareza: 'raro', clases: 'ring-4 ring-pink-400' },
  {
    id: 'fuego',
    nombre: 'Fuego',
    precio: 350,
    rareza: 'epico',
    clases: 'ring-4 ring-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.65)]',
  },
  {
    id: 'electrico',
    nombre: 'Eléctrico',
    precio: 350,
    rareza: 'epico',
    clases: 'ring-4 ring-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.65)]',
  },
  {
    id: 'legendario',
    nombre: 'Legendario',
    precio: 700,
    rareza: 'legendario',
    clases: 'ring-4 ring-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.8)]',
  },
];

/** Catálogo de títulos — se muestran como una píldora junto al nombre en el mural. */
export const TITULOS: ItemTitulo[] = [
  { id: 'crack', texto: '🚀 Crack', precio: 100, rareza: 'comun' },
  { id: 'madrugador', texto: '🌅 Madrugador', precio: 100, rareza: 'comun' },
  { id: 'colaborador_estrella', texto: '🤝 Colaborador estrella', precio: 200, rareza: 'raro' },
  { id: 'imparable', texto: '⚡ Imparable', precio: 200, rareza: 'raro' },
  { id: 'mentor', texto: '🎓 Mentor', precio: 300, rareza: 'epico' },
  { id: 'leyenda', texto: '🌟 Leyenda del equipo', precio: 500, rareza: 'legendario' },
];

/**
 * Catálogo de fondos especiales EN VENTA — a diferencia de los fondos
 * normales (siempre gratis) y de "lluvia_llovizna" (el único especial que
 * se deja libre), estos requieren comprarlos. El id debe existir en
 * FONDOS_MURAL_IDS (mural-fondos.constant.ts) y su css/label real vive en
 * el frontend (dashboard/lib/mural-fondos.ts), igual que el resto de fondos.
 */
export const FONDOS: ItemFondo[] = [
  { id: 'lluvia_normal', nombre: 'Lluvia', precio: 200, rareza: 'raro' },
  { id: 'cobre_ardiente', nombre: 'Cobre Ardiente', precio: 250, rareza: 'raro' },
  { id: 'lluvia_tormenta', nombre: 'Tormenta', precio: 350, rareza: 'epico' },
  { id: 'esmeralda_imperial', nombre: 'Esmeralda Imperial', precio: 400, rareza: 'epico' },
  { id: 'nebulosa', nombre: 'Nebulosa', precio: 400, rareza: 'epico' },
  { id: 'obsidiana_real', nombre: 'Obsidiana Real', precio: 600, rareza: 'legendario' },
];
