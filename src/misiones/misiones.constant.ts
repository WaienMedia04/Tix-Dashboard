export type PeriodoMision = 'diaria' | 'semanal' | 'mensual';

export interface MisionDefinicion {
  id: string;
  periodo: PeriodoMision;
  nombre: string;
  descripcion: string;
  icono: string;
  /** Tipo(s) de TalentoProgresoEvento que cuentan para esta misión — si son varios, se suman. */
  tiposEvento: string[];
  meta: number;
  recompensaXp: number;
  recompensaMonedas: number;
}

/**
 * Catálogo de misiones (doc "Actualización Mural 2.0" #22) — el progreso se
 * calcula sumando eventos ya existentes en TalentoProgresoEvento dentro de
 * la ventana del período, así que reclamar una misión es una recompensa
 * EXTRA encima de la que ya dio la acción individual, no un reemplazo.
 */
export const MISIONES: MisionDefinicion[] = [
  {
    id: 'diaria_bitacora',
    periodo: 'diaria',
    nombre: 'Envía tu bitácora de hoy',
    descripcion: 'Registra tu bitácora del día.',
    icono: '🌅',
    tiposEvento: ['bitacora_enviada'],
    meta: 1,
    recompensaXp: 10,
    recompensaMonedas: 10,
  },
  {
    id: 'diaria_comentario',
    periodo: 'diaria',
    nombre: 'Comenta una publicación',
    descripcion: 'Deja un comentario en la pizarra.',
    icono: '💬',
    tiposEvento: ['comentario_publicado'],
    meta: 1,
    recompensaXp: 10,
    recompensaMonedas: 5,
  },
  {
    id: 'diaria_cofre',
    periodo: 'diaria',
    nombre: 'Abre tu cofre del día',
    descripcion: 'Reclama el cofre diario.',
    icono: '🎁',
    tiposEvento: ['cofre_diario'],
    meta: 1,
    recompensaXp: 10,
    recompensaMonedas: 5,
  },
  {
    id: 'diaria_trivia',
    periodo: 'diaria',
    nombre: 'Acierta la trivia del día',
    descripcion: 'Responde correctamente la trivia de hoy.',
    icono: '🧠',
    tiposEvento: ['trivia_ganada'],
    meta: 1,
    recompensaXp: 10,
    recompensaMonedas: 5,
  },
  {
    id: 'semanal_bitacoras',
    periodo: 'semanal',
    nombre: 'Envía 5 bitácoras esta semana',
    descripcion: 'Mantén tu ritmo durante la semana.',
    icono: '📚',
    tiposEvento: ['bitacora_enviada'],
    meta: 5,
    recompensaXp: 40,
    recompensaMonedas: 30,
  },
  {
    id: 'semanal_reconocimientos',
    periodo: 'semanal',
    nombre: 'Recibe 2 reconocimientos',
    descripcion: 'De un compañero o de CEO/RRHH, cuentan los dos tipos.',
    icono: '🏆',
    tiposEvento: ['reconocimiento_recibido', 'reconocimiento_rapido_recibido'],
    meta: 2,
    recompensaXp: 40,
    recompensaMonedas: 30,
  },
  {
    id: 'semanal_ideas',
    periodo: 'semanal',
    nombre: 'Comparte 2 publicaciones o ideas',
    descripcion: 'Participa en la pizarra del equipo.',
    icono: '📣',
    tiposEvento: ['post_compartido'],
    meta: 2,
    recompensaXp: 30,
    recompensaMonedas: 25,
  },
  {
    id: 'mensual_bitacoras',
    periodo: 'mensual',
    nombre: 'Envía 15 bitácoras este mes',
    descripcion: 'Constancia a lo largo del mes.',
    icono: '🗓️',
    tiposEvento: ['bitacora_enviada'],
    meta: 15,
    recompensaXp: 100,
    recompensaMonedas: 80,
  },
  {
    id: 'mensual_logro',
    periodo: 'mensual',
    nombre: 'Desbloquea un logro este mes',
    descripcion: 'Cualquier logro del catálogo cuenta.',
    icono: '⭐',
    tiposEvento: ['logro_desbloqueado'],
    meta: 1,
    recompensaXp: 80,
    recompensaMonedas: 60,
  },
];
