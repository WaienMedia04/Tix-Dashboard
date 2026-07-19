import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/** Todos los campos son opcionales — el llamador manda solo lo que cambió. */
export class ActualizarTalentoDto {
  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: 'activo' | 'inactivo';

  @IsOptional()
  @IsString()
  @MaxLength(160)
  rol?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  departamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  cedula?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  correo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  telefono?: string;

  /**
   * String, no @IsDateString(): una cadena vacía es la señal para borrar
   * la fecha de ingreso (mismo criterio que el resto de campos opcionales
   * de este DTO — el servicio hace `dto.fechaIngreso ? new Date(...) : null`),
   * y @IsDateString() rechazaría "" antes de llegar ahí.
   */
  @IsOptional()
  @IsString()
  fechaIngreso?: string;

  /** Mismo criterio que fechaIngreso — string vacío borra la fecha. */
  @IsOptional()
  @IsString()
  fechaNacimiento?: string;
}
