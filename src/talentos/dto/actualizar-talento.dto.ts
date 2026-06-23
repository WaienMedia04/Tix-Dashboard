import { IsIn } from 'class-validator';

export class ActualizarTalentoDto {
  @IsIn(['activo', 'inactivo'])
  estado!: 'activo' | 'inactivo';
}
