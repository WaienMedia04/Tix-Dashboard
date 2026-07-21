import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TipoSoporte } from '@prisma/client';

export class CrearSolicitudSoporteDto {
  @IsIn(['AVERIA', 'SUGERENCIA'])
  tipo!: TipoSoporte;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  mensaje!: string;
}
