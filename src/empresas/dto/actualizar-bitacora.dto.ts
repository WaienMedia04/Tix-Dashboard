import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Edición manual de una bitácora por CEO/RRHH — para corregir un error del
 * agente de IA (evaluación equivocada, contenido mal transcrito, etc.).
 */
export class ActualizarBitacoraDto {
  @IsOptional()
  @IsString()
  tareasPlanificadas?: string;

  @IsOptional()
  @IsString()
  actividadesRealizadas?: string;

  @IsOptional()
  @IsString()
  capacitacion?: string;

  @IsOptional()
  @IsString()
  queSeEjecuto?: string;

  @IsOptional()
  @IsString()
  detallesRelevantes?: string;

  @IsOptional()
  @IsString()
  informeAvances?: string;

  @IsOptional()
  @IsString()
  objetivoDia?: string;

  @IsOptional()
  @IsString()
  estadoEnvio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  puntajeIA?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cumplimientoTareas?: number;

  @IsOptional()
  @IsString()
  calificacionCeo?: string;

  @IsOptional()
  @IsString()
  notasTix?: string;
}
