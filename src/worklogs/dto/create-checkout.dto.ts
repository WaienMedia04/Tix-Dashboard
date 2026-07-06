import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  empresaSlug: string;

  @IsString()
  talentoNombre: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  dia?: string;

  @IsOptional()
  @IsInt()
  semana?: number;

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
  @IsString()
  horaEnvio?: string;

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
