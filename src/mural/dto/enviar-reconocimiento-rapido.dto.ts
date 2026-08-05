import { IsIn } from 'class-validator';
import { TipoReconocimientoRapido } from '@prisma/client';

const TIPOS: TipoReconocimientoRapido[] = [
  'GRACIAS',
  'EXCELENTE_TRABAJO',
  'CRACK',
  'INSPIRADOR',
  'BUENA_IDEA',
  'GRAN_COMPANERO',
];

export class EnviarReconocimientoRapidoDto {
  @IsIn(TIPOS)
  tipo!: TipoReconocimientoRapido;
}
