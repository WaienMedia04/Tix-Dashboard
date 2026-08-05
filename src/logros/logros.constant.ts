export interface LogroDefinicion {
  id: string;
  nombre: string;
  descripcion: string;
  /** Clave que resuelve el ícono real en dashboard/lib/iconos-catalogo.ts. */
  icono: string;
  /** Valor de la métrica en `MetricasLogro` que hay que alcanzar para desbloquearlo. */
  meta: number;
  recompensaXp: number;
  recompensaMonedas: number;
}

export interface MetricasLogro {
  primer_dia: number;
  primera_bitacora: number;
  racha_7: number;
  racha_30: number;
  bitacoras_100: number;
  reconocimientos_50: number;
  comentarios_100: number;
  ayudaste_companero: number;
  idea_aprobada: number;
}

/**
 * Catálogo de logros (doc "Actualización Mural 2.0" #5) — solo incluye los
 * que se pueden medir con datos que ya existen hoy. "Top del mes" queda
 * pendiente de una fase de Rankings persistidos por período.
 */
export const LOGROS: LogroDefinicion[] = [
  {
    id: 'primer_dia',
    nombre: 'Primer día',
    descripcion: 'Te uniste a la aventura en TalentiX.',
    icono: 'party-popper',
    meta: 1,
    recompensaXp: 10,
    recompensaMonedas: 10,
  },
  {
    id: 'primera_bitacora',
    nombre: 'Primera bitácora',
    descripcion: 'Enviaste tu primera bitácora.',
    icono: 'file-text',
    meta: 1,
    recompensaXp: 20,
    recompensaMonedas: 15,
  },
  {
    id: 'racha_7',
    nombre: '7 días seguidos',
    descripcion: 'Mantuviste una racha de 7 días enviando bitácora.',
    icono: 'flame',
    meta: 7,
    recompensaXp: 40,
    recompensaMonedas: 30,
  },
  {
    id: 'racha_30',
    nombre: '30 días seguidos',
    descripcion: 'Mantuviste una racha de 30 días enviando bitácora.',
    icono: 'zap',
    meta: 30,
    recompensaXp: 120,
    recompensaMonedas: 100,
  },
  {
    id: 'bitacoras_100',
    nombre: '100 bitácoras',
    descripcion: 'Enviaste 100 bitácoras en total.',
    icono: 'book-open',
    meta: 100,
    recompensaXp: 150,
    recompensaMonedas: 120,
  },
  {
    id: 'reconocimientos_50',
    nombre: '50 reconocimientos',
    descripcion: 'Recibiste 50 reconocimientos de tus compañeros.',
    icono: 'trophy',
    meta: 50,
    recompensaXp: 150,
    recompensaMonedas: 120,
  },
  {
    id: 'comentarios_100',
    nombre: '100 comentarios',
    descripcion: 'Comentaste 100 publicaciones en la pizarra.',
    icono: 'message-circle',
    meta: 100,
    recompensaXp: 100,
    recompensaMonedas: 80,
  },
  {
    id: 'ayudaste_companero',
    nombre: 'Ayudé a un compañero',
    descripcion: 'Le dejaste una nota de apoyo a un compañero en su mural.',
    icono: 'handshake',
    meta: 1,
    recompensaXp: 20,
    recompensaMonedas: 15,
  },
  {
    id: 'idea_aprobada',
    nombre: 'Idea aprobada',
    descripcion: 'CEO/RRHH aprobó una idea que compartiste en la pizarra.',
    icono: 'lightbulb',
    meta: 1,
    recompensaXp: 30,
    recompensaMonedas: 20,
  },
];
