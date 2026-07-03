import { IsOptional, IsString } from 'class-validator';

export class EditarTalentoAdminDto {
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  @IsString()
  @IsOptional()
  rol?: string;

  @IsString()
  @IsOptional()
  cedula?: string;

  @IsString()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  fechaIngreso?: string | null;

  @IsString()
  @IsOptional()
  fechaNacimiento?: string | null;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
