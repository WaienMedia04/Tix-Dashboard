import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { COLORES_NOTA_MURAL } from '../mural-notas-colores.constant';

export class ActualizarNotaDto {
  @IsString()
  @IsOptional()
  @MaxLength(280)
  texto?: string;

  @IsString()
  @IsOptional()
  @IsIn(COLORES_NOTA_MURAL)
  color?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  posX?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  posY?: number;

  @IsNumber()
  @IsOptional()
  @Min(-45)
  @Max(45)
  rotacion?: number;

  @IsInt()
  @IsOptional()
  zIndex?: number;
}
