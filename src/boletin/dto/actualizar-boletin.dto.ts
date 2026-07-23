import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
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

  /** URL de Vercel Blob, o null explícito para quitar la imagen. */
  @IsOptional()
  @ValidateIf((o: ActualizarBoletinDto) => o.imagenUrl !== null)
  @IsUrl()
  imagenUrl?: string | null;
}
