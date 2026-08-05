export type RarezaItemTienda = 'comun' | 'raro' | 'epico' | 'legendario';

export interface ItemMarco {
  id: string;
  nombre: string;
  precio: number;
  rareza: RarezaItemTienda;
  descripcion: string;
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
  descripcion: string;
}

export interface ItemFondo {
  id: string;
  nombre: string;
  precio: number;
  rareza: RarezaItemTienda;
  descripcion: string;
}

export interface ItemMascota {
  id: string;
  nombre: string;
  precio: number;
  rareza: RarezaItemTienda;
  descripcion: string;
}

export interface ItemColorNombre {
  id: string;
  nombre: string;
  precio: number;
  rareza: RarezaItemTienda;
  descripcion: string;
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
    descripcion:
      'Un anillo dorado alrededor de tu carnet — brillo clásico y elegante.',
    clases: 'ring-4 ring-amber-400',
  },
  {
    id: 'esmeralda',
    nombre: 'Esmeralda',
    precio: 450,
    rareza: 'raro',
    descripcion: 'Un halo verde esmeralda que resalta tu carnet en el mural.',
    clases: 'ring-4 ring-emerald-400',
  },
  {
    id: 'zafiro',
    nombre: 'Zafiro',
    precio: 450,
    rareza: 'raro',
    descripcion: 'Un aro azul zafiro con un brillo frío y sofisticado.',
    clases: 'ring-4 ring-sky-400',
  },
  {
    id: 'rosa',
    nombre: 'Rosa',
    precio: 450,
    rareza: 'raro',
    descripcion: 'Un marco rosado suave, ideal para destacar con estilo.',
    clases: 'ring-4 ring-pink-400',
  },
  {
    id: 'fuego',
    nombre: 'Fuego',
    precio: 850,
    rareza: 'epico',
    descripcion:
      'Un anillo naranja con resplandor ardiente, para quien juega con intensidad.',
    clases: 'ring-4 ring-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.65)]',
  },
  {
    id: 'electrico',
    nombre: 'Eléctrico',
    precio: 850,
    rareza: 'epico',
    descripcion:
      'Un aro violeta con resplandor eléctrico, como una descarga de energía.',
    clases: 'ring-4 ring-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.65)]',
  },
  {
    id: 'legendario',
    nombre: 'Legendario',
    precio: 1600,
    rareza: 'legendario',
    descripcion:
      'El marco más exclusivo de la Tienda — un resplandor dorado reservado para pocos.',
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
    descripcion: 'Un título directo para quien resuelve todo sin drama.',
  },
  {
    id: 'madrugador',
    texto: 'Madrugador',
    icono: 'sunrise',
    precio: 180,
    rareza: 'comun',
    descripcion: 'Para quien siempre es de los primeros en enviar su bitácora.',
  },
  {
    id: 'colaborador_estrella',
    texto: 'Colaborador estrella',
    icono: 'handshake',
    precio: 450,
    rareza: 'raro',
    descripcion: 'Reconoce a quien siempre está ahí para ayudar al equipo.',
  },
  {
    id: 'imparable',
    texto: 'Imparable',
    icono: 'zap',
    precio: 450,
    rareza: 'raro',
    descripcion: 'Para el talento que no se detiene, racha tras racha.',
  },
  {
    id: 'mentor',
    texto: 'Mentor',
    icono: 'graduation-cap',
    precio: 800,
    rareza: 'epico',
    descripcion: 'Un título de respeto para quien guía y enseña a los demás.',
  },
  {
    id: 'leyenda',
    texto: 'Leyenda del equipo',
    icono: 'crown',
    precio: 1500,
    rareza: 'legendario',
    descripcion:
      'El título más alto del mural — solo para leyendas del equipo.',
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
  {
    id: 'lluvia_normal',
    nombre: 'Lluvia',
    precio: 450,
    rareza: 'raro',
    descripcion:
      'Gotas cayendo en tiempo real sobre tu mural — ambiente tranquilo de lluvia.',
  },
  {
    id: 'cobre_ardiente',
    nombre: 'Cobre Ardiente',
    precio: 500,
    rareza: 'raro',
    descripcion: 'Un degradado cobrizo intenso, cálido y con carácter.',
  },
  {
    id: 'lluvia_tormenta',
    nombre: 'Tormenta',
    precio: 850,
    rareza: 'epico',
    descripcion:
      'Lluvia intensa con relámpagos ocasionales — para los audaces.',
  },
  {
    id: 'esmeralda_imperial',
    nombre: 'Esmeralda Imperial',
    precio: 900,
    rareza: 'epico',
    descripcion: 'Un verde profundo con destellos, digno de la realeza.',
  },
  {
    id: 'nebulosa',
    nombre: 'Nebulosa',
    precio: 900,
    rareza: 'epico',
    descripcion: 'Colores de galaxia lejana flotando detrás de tu carnet.',
  },
  {
    id: 'obsidiana_real',
    nombre: 'Obsidiana Real',
    precio: 1600,
    rareza: 'legendario',
    descripcion:
      'Negro absoluto con destellos dorados — uno de los fondos más exclusivos.',
  },
  {
    id: 'oceano_profundo',
    nombre: 'Océano Profundo',
    precio: 500,
    rareza: 'raro',
    descripcion:
      'Un degradado azul que fluye solo, como las corrientes del mar.',
  },
  {
    id: 'galaxia',
    nombre: 'Galaxia',
    precio: 850,
    rareza: 'epico',
    descripcion:
      'Tonos violeta en movimiento constante, como una galaxia viva.',
  },
  {
    id: 'aurora_boreal',
    nombre: 'Aurora Boreal',
    precio: 900,
    rareza: 'epico',
    descripcion:
      'Verdes y turquesas que se mueven como una aurora boreal real.',
  },
  {
    id: 'lava_fluida',
    nombre: 'Lava Fluida',
    precio: 1300,
    rareza: 'legendario',
    descripcion:
      'Naranjas y rojos fluyendo como lava — intenso y en movimiento constante.',
  },
  {
    id: 'cristal_arcoiris',
    nombre: 'Cristal Arcoíris',
    precio: 1800,
    rareza: 'legendario',
    descripcion:
      'Todo el espectro de color fluyendo sin parar — el fondo más vistoso de la Tienda.',
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
  {
    id: 'genie',
    nombre: 'Genio',
    precio: 550,
    rareza: 'raro',
    descripcion: 'Un genio servicial que aparece en tu mural para acompañarte.',
  },
  {
    id: 'links',
    nombre: 'Links',
    precio: 600,
    rareza: 'raro',
    descripcion: 'Un gato curioso con mucha personalidad.',
  },
  {
    id: 'peedy',
    nombre: 'Peedy',
    precio: 900,
    rareza: 'epico',
    descripcion: 'Un loro parlanchín, siempre con algo que decir.',
  },
  {
    id: 'rocky',
    nombre: 'Rocky',
    precio: 950,
    rareza: 'epico',
    descripcion: 'Un perro leal que no se despega de tu carnet.',
  },
  {
    id: 'genius',
    nombre: 'Genius',
    precio: 1000,
    rareza: 'epico',
    descripcion: 'Un profesor con más de una idea bajo la manga.',
  },
  {
    id: 'merlin',
    nombre: 'Merlín',
    precio: 1600,
    rareza: 'legendario',
    descripcion:
      'Un mago con trucos bajo la manga — una de las mascotas más raras del mural.',
  },
  {
    id: 'rover',
    nombre: 'Rover',
    precio: 2000,
    rareza: 'legendario',
    descripcion:
      'El robot explorador más codiciado — la mascota más exclusiva de toda la Tienda.',
  },
];

/**
 * Catálogo de colores de nombre EN VENTA — a diferencia de los 9 colores
 * originales (siempre gratis, ver COLORES_NOMBRE_MURAL_IDS_GRATIS en
 * src/mural/mural-colores-nombre.constant.ts), estos hay que comprarlos. El
 * id debe existir en COLORES_NOMBRE_MURAL_IDS (mural-colores-nombre.constant.ts)
 * y su degradado real vive en el frontend (dashboard/lib/mural-colores-nombre.ts).
 */
export const COLORES_NOMBRE: ItemColorNombre[] = [
  {
    id: 'lavanda',
    nombre: 'Lavanda',
    precio: 400,
    rareza: 'raro',
    descripcion: 'Un degradado lavanda suave — elegante y relajado.',
  },
  {
    id: 'menta',
    nombre: 'Menta',
    precio: 400,
    rareza: 'raro',
    descripcion: 'Tonos verde menta frescos para tu nombre.',
  },
  {
    id: 'cereza',
    nombre: 'Cereza',
    precio: 400,
    rareza: 'raro',
    descripcion: 'Un rojo cereza intenso, directo y llamativo.',
  },
  {
    id: 'zafiro',
    nombre: 'Zafiro',
    precio: 400,
    rareza: 'raro',
    descripcion: 'Azules profundos como un zafiro pulido.',
  },
  {
    id: 'topacio',
    nombre: 'Topacio',
    precio: 400,
    rareza: 'raro',
    descripcion: 'Ámbar dorado con calidez, como un topacio al sol.',
  },
  {
    id: 'plata',
    nombre: 'Plata',
    precio: 400,
    rareza: 'raro',
    descripcion: 'Un brillo plateado, limpio y sobrio.',
  },
  {
    id: 'esmeralda',
    nombre: 'Esmeralda',
    precio: 800,
    rareza: 'epico',
    descripcion: 'Verde esmeralda intenso para un nombre que resalta.',
  },
  {
    id: 'amatista',
    nombre: 'Amatista',
    precio: 800,
    rareza: 'epico',
    descripcion: 'Violeta profundo con un toque místico.',
  },
  {
    id: 'rubi',
    nombre: 'Rubí',
    precio: 800,
    rareza: 'epico',
    descripcion:
      'Rojo rubí intenso — para nombres que no pasan desapercibidos.',
  },
  {
    id: 'neon_verde',
    nombre: 'Neón Verde',
    precio: 800,
    rareza: 'epico',
    descripcion: 'Verde neón vibrante, imposible de ignorar.',
  },
  {
    id: 'neon_rosa',
    nombre: 'Neón Rosa',
    precio: 800,
    rareza: 'epico',
    descripcion: 'Rosa neón brillante con toda la actitud.',
  },
  {
    id: 'oro_rosa',
    nombre: 'Oro Rosa',
    precio: 800,
    rareza: 'epico',
    descripcion: 'Un degradado rosa dorado, cálido y moderno.',
  },
  {
    id: 'medianoche',
    nombre: 'Medianoche',
    precio: 1500,
    rareza: 'legendario',
    descripcion: 'Azules oscuros profundos, como el cielo a medianoche.',
  },
  {
    id: 'platino_real',
    nombre: 'Platino Real',
    precio: 1600,
    rareza: 'legendario',
    descripcion: 'Un blanco platino con destellos — puro lujo.',
  },
  {
    id: 'arcoiris',
    nombre: 'Arcoíris',
    precio: 1800,
    rareza: 'legendario',
    descripcion:
      'Todo el espectro de color en tu nombre — el color más exclusivo del mural.',
  },
];
