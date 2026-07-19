import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { FONDOS_MURAL_IDS } from '../mural-fondos.constant';

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

  @IsString()
  @IsOptional()
  @IsIn(FONDOS_MURAL_IDS)
  fondoId?: string;
}
