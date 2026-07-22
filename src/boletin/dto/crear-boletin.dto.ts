import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoBoletin } from '@prisma/client';

export class CrearBoletinDto {
  @IsEnum(TipoBoletin)
  tipo!: TipoBoletin;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  contenido!: string;

  /** Solo tiene sentido cuando tipo = EVENTO. */
  @IsDateString()
  @IsOptional()
  fechaEvento?: string;
}
