import { TipoNovedad } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class NovedadesQueryDto {
  @IsOptional()
  @IsString()
  talentoId?: string;

  @IsOptional()
  @IsEnum(TipoNovedad)
  tipo?: TipoNovedad;

  @IsOptional()
  @IsString()
  departamento?: string;
}
