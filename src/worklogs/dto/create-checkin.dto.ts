import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCheckinDto {
  @IsString()
  empresaSlug: string;

  @IsString()
  talentoNombre: string;

  @IsString()
  codigoAcceso: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  dia?: string;

  @IsOptional()
  @IsInt()
  semana?: number;

  @IsString()
  tareasPlanificadas: string;

  @IsOptional()
  @IsString()
  horaCheckin?: string;
}
