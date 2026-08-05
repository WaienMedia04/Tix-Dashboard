export interface ItemMarco {
  id: string;
  nombre: string;
  precio: number;
  /** Clases Tailwind del anillo/resplandor alrededor del carnet — mismo id que dashboard/lib/tienda-catalogo.ts. */
  clases: string;
}

export interface ItemTitulo {
  id: string;
  texto: string;
  precio: number;
}

/** Catálogo de marcos (doc "Actualización Mural 2.0" #4 y #20) — decoran el carnet del mural. */
export const MARCOS: ItemMarco[] = [
  { id: 'dorado', nombre: 'Dorado', precio: 150, clases: 'ring-4 ring-amber-400' },
  { id: 'esmeralda', nombre: 'Esmeralda', precio: 150, clases: 'ring-4 ring-emerald-400' },
  { id: 'zafiro', nombre: 'Zafiro', precio: 150, clases: 'ring-4 ring-sky-400' },
  { id: 'rosa', nombre: 'Rosa', precio: 150, clases: 'ring-4 ring-pink-400' },
  {
    id: 'fuego',
    nombre: 'Fuego',
    precio: 300,
    clases: 'ring-4 ring-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.65)]',
  },
  {
    id: 'electrico',
    nombre: 'Eléctrico',
    precio: 300,
    clases: 'ring-4 ring-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.65)]',
  },
  {
    id: 'legendario',
    nombre: 'Legendario',
    precio: 600,
    clases: 'ring-4 ring-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.8)]',
  },
];

/** Catálogo de títulos — se muestran como una píldora junto al nombre en el mural. */
export const TITULOS: ItemTitulo[] = [
  { id: 'crack', texto: '🚀 Crack', precio: 100 },
  { id: 'madrugador', texto: '🌅 Madrugador', precio: 100 },
  { id: 'colaborador_estrella', texto: '🤝 Colaborador estrella', precio: 200 },
  { id: 'imparable', texto: '⚡ Imparable', precio: 200 },
  { id: 'mentor', texto: '🎓 Mentor', precio: 250 },
  { id: 'leyenda', texto: '🌟 Leyenda del equipo', precio: 400 },
];
