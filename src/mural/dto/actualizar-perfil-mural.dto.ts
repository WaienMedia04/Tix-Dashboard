import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { FONDOS_MURAL_IDS } from '../mural-fondos.constant';
import { COLORES_NOMBRE_MURAL_IDS } from '../mural-colores-nombre.constant';

export class ActualizarPerfilMuralDto {
  @IsString()
  @IsOptional()
  @MaxLength(40)
  apodo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  meGusta?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  noMeGusta?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  cancionFavorita?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  superpoder?: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  personalidades?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(40)
  estado?: string;

  @IsString()
  @IsOptional()
  @IsIn(FONDOS_MURAL_IDS)
  fondoId?: string;

  @IsString()
  @IsOptional()
  @IsIn(COLORES_NOMBRE_MURAL_IDS)
  colorNombreId?: string;
}
