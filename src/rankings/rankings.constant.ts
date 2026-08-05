export type CategoriaRanking =
  | 'xp'
  | 'actividad'
  | 'bitacoras'
  | 'reconocimientos'
  | 'comentarios'
  | 'racha';

export type PeriodoRanking = 'semanal' | 'mensual' | 'historico';

export const CATEGORIAS_RANKING: CategoriaRanking[] = [
  'xp',
  'actividad',
  'bitacoras',
  'reconocimientos',
  'comentarios',
  'racha',
];

export const PERIODOS_RANKING: PeriodoRanking[] = [
  'semanal',
  'mensual',
  'historico',
];

export const ETIQUETAS_CATEGORIA: Record<CategoriaRanking, string> = {
  xp: 'Mayor XP',
  actividad: 'Empleado más activo',
  bitacoras: 'Más bitácoras',
  reconocimientos: 'Más reconocimientos',
  comentarios: 'Más comentarios',
  racha: 'Mayor racha',
};
