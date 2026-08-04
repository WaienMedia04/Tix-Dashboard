import { IsIn } from 'class-validator';

export class ActualizarEstadoSolicitudDto {
  @IsIn(['NUEVA', 'EN_PROCESO', 'COMPLETADA'])
  estado!: 'NUEVA' | 'EN_PROCESO' | 'COMPLETADA';
}
