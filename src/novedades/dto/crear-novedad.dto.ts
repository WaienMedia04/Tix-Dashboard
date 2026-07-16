import { TipoNovedad } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearNovedadDto {
  @IsString()
  @IsNotEmpty()
  talentoId!: string;

  @IsEnum(TipoNovedad)
  tipo!: TipoNovedad;

  @IsDateString()
  fecha!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descripcion!: string;
}
