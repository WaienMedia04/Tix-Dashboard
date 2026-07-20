import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { COLORES_NOTA_MURAL } from '../mural-notas-colores.constant';

/** Nota que un compañero le deja a OTRO talento. */
export class EnviarNotaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  texto!: string;

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
}
