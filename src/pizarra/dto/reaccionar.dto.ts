import { IsIn } from 'class-validator';
import { EMOJIS_REACCION_PIZARRA } from '../emojis-reaccion.constant';

export class ReaccionarDto {
  @IsIn(EMOJIS_REACCION_PIZARRA)
  emoji!: string;
}
