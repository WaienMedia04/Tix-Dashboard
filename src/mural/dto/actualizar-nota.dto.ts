import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PATRON_COLOR_NOTA } from '../mural-notas-colores.constant';
import { BORDES_NOTA_IDS } from '../mural-nota-bordes.constant';

export class ActualizarNotaDto {
  @IsString()
  @IsOptional()
  @MaxLength(280)
  texto?: string;

  /** Id de la paleta fija (ej. "amarillo") o color libre en hexadecimal (ej. "#a1b2c3"). */
  @IsString()
  @IsOptional()
  @Matches(PATRON_COLOR_NOTA, { message: 'Color inválido' })
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

  @IsNumber()
  @IsOptional()
  @Min(0.7)
  @Max(1.8)
  escala?: number;

  /** Borde especial comprado en la Tienda — null explícito para quitarlo. La titularidad se valida en MuralService. */
  @IsOptional()
  @ValidateIf((o: ActualizarNotaDto) => o.bordeId !== null)
  @IsIn(BORDES_NOTA_IDS)
  bordeId?: string | null;
}
