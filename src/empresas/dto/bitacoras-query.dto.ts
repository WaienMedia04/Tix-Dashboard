import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export type EstadoFiltro = 'enviada' | 'no_enviada' | 'permiso';

export class BitacorasQueryDto {
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  talentoId?: string;

  @IsOptional()
  @IsIn(['enviada', 'no_enviada', 'permiso'])
  estado?: EstadoFiltro;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
