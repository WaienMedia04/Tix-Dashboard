import { TipoAusencia } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearAusenciaDto {
  @IsString()
  @IsNotEmpty()
  talentoId!: string;

  @IsEnum(TipoAusencia)
  tipo!: TipoAusencia;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
