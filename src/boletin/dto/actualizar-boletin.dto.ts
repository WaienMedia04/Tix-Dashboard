import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoBoletin } from '@prisma/client';

export class ActualizarBoletinDto {
  @IsEnum(TipoBoletin)
  @IsOptional()
  tipo?: TipoBoletin;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  titulo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  contenido?: string;

  @IsDateString()
  @IsOptional()
  fechaEvento?: string;
}
