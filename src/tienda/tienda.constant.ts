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
  /** Clave que resuelve el ícono real en dashboard/lib/iconos-catalogo.ts — se muestra junto al texto. */
  icono: string;
  precio: number;
  rareza: RarezaItemTienda;
}

export interface ItemFondo {
  id: string;
  nombre: string;
  precio: number;
  rareza: RarezaItemTienda;
}

export interface ItemMascota {
  id: string;
  nombre: string;
  precio: number;
  rareza: RarezaItemTienda;
}

/**
 * Catálogo de marcos (doc "Actualización Mural 2.0" #4 y #20) — decoran el
 * carnet del mural. Precios "retantes": alcanzarlos con las monedas que se
 * ganan en el día a día (bitácoras, reconocimientos, misiones) toma varios
 * días de juego constante, no un par de bitácoras.
 */
export const MARCOS: ItemMarco[] = [
  {
    id: 'dorado',
    nombre: 'Dorado',
    precio: 450,
    rareza: 'raro',
    clases: 'ring-4 ring-amber-400',
  },
  {
    id: 'esmeralda',
    nombre: 'Esmeralda',
    precio: 450,
    rareza: 'raro',
    clases: 'ring-4 ring-emerald-400',
  },
  {
    id: 'zafiro',
    nombre: 'Zafiro',
    precio: 450,
    rareza: 'raro',
    clases: 'ring-4 ring-sky-400',
  },
  {
    id: 'rosa',
    nombre: 'Rosa',
    precio: 450,
    rareza: 'raro',
    clases: 'ring-4 ring-pink-400',
  },
  {
    id: 'fuego',
    nombre: 'Fuego',
    precio: 850,
    rareza: 'epico',
    clases: 'ring-4 ring-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.65)]',
  },
  {
    id: 'electrico',
    nombre: 'Eléctrico',
    precio: 850,
    rareza: 'epico',
    clases: 'ring-4 ring-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.65)]',
  },
  {
    id: 'legendario',
    nombre: 'Legendario',
    precio: 1600,
    rareza: 'legendario',
    clases: 'ring-4 ring-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.8)]',
  },
];

/** Catálogo de títulos — se muestran como una píldora junto al nombre en el mural. */
export const TITULOS: ItemTitulo[] = [
  {
    id: 'crack',
    texto: 'Crack',
    icono: 'rocket',
    precio: 180,
    rareza: 'comun',
  },
  {
    id: 'madrugador',
    texto: 'Madrugador',
    icono: 'sunrise',
    precio: 180,
    rareza: 'comun',
  },
  {
    id: 'colaborador_estrella',
    texto: 'Colaborador estrella',
    icono: 'handshake',
    precio: 450,
    rareza: 'raro',
  },
  {
    id: 'imparable',
    texto: 'Imparable',
    icono: 'zap',
    precio: 450,
    rareza: 'raro',
  },
  {
    id: 'mentor',
    texto: 'Mentor',
    icono: 'graduation-cap',
    precio: 800,
    rareza: 'epico',
  },
  {
    id: 'leyenda',
    texto: 'Leyenda del equipo',
    icono: 'crown',
    precio: 1500,
    rareza: 'legendario',
  },
];

/**
 * Catálogo de fondos especiales EN VENTA — a diferencia de los fondos
 * normales (siempre gratis) y de "lluvia_llovizna" (el único especial que
 * se deja libre), estos requieren comprarlos. El id debe existir en
 * FONDOS_MURAL_IDS (mural-fondos.constant.ts) y su css/label real vive en
 * el frontend (dashboard/lib/mural-fondos.ts), igual que el resto de fondos.
 * Los últimos 5 son los fondos animados nuevos (degradado en movimiento).
 */
export const FONDOS: ItemFondo[] = [
  { id: 'lluvia_normal', nombre: 'Lluvia', precio: 450, rareza: 'raro' },
  {
    id: 'cobre_ardiente',
    nombre: 'Cobre Ardiente',
    precio: 500,
    rareza: 'raro',
  },
  { id: 'lluvia_tormenta', nombre: 'Tormenta', precio: 850, rareza: 'epico' },
  {
    id: 'esmeralda_imperial',
    nombre: 'Esmeralda Imperial',
    precio: 900,
    rareza: 'epico',
  },
  { id: 'nebulosa', nombre: 'Nebulosa', precio: 900, rareza: 'epico' },
  {
    id: 'obsidiana_real',
    nombre: 'Obsidiana Real',
    precio: 1600,
    rareza: 'legendario',
  },
  {
    id: 'oceano_profundo',
    nombre: 'Océano Profundo',
    precio: 500,
    rareza: 'raro',
  },
  { id: 'galaxia', nombre: 'Galaxia', precio: 850, rareza: 'epico' },
  {
    id: 'aurora_boreal',
    nombre: 'Aurora Boreal',
    precio: 900,
    rareza: 'epico',
  },
  {
    id: 'lava_fluida',
    nombre: 'Lava Fluida',
    precio: 1300,
    rareza: 'legendario',
  },
  {
    id: 'cristal_arcoiris',
    nombre: 'Cristal Arcoíris',
    precio: 1800,
    rareza: 'legendario',
  },
];

/**
 * Catálogo de mascotas EN VENTA — a diferencia de clippy/bonzi/f1 (siempre
 * gratis, ver MASCOTA_IDS_GRATIS en src/mural/mural-mascota.constant.ts),
 * el resto del elenco de clippyjs hay que comprarlo. Precios altos a
 * propósito: son el ítem más caro de la Tienda, un verdadero reto de
 * ahorro para un talento.
 */
export const MASCOTAS: ItemMascota[] = [
  { id: 'genie', nombre: 'Genio', precio: 550, rareza: 'raro' },
  { id: 'links', nombre: 'Links', precio: 600, rareza: 'raro' },
  { id: 'peedy', nombre: 'Peedy', precio: 900, rareza: 'epico' },
  { id: 'rocky', nombre: 'Rocky', precio: 950, rareza: 'epico' },
  { id: 'genius', nombre: 'Genius', precio: 1000, rareza: 'epico' },
  { id: 'merlin', nombre: 'Merlín', precio: 1600, rareza: 'legendario' },
  { id: 'rover', nombre: 'Rover', precio: 2000, rareza: 'legendario' },
];
