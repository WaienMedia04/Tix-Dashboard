import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TipoRegistroWorklog {
  CHECKIN = 'checkin',
  CHECKOUT = 'checkout',
}

/**
 * Body del autoservicio de bitácoras (POST /talentos/me/worklogs). A
 * diferencia de CreateCheckinDto/CreateCheckoutDto (que usa ClawLink y
 * resuelve el talento por nombre) esto siempre opera sobre la bitácora de
 * HOY del talento autenticado — no acepta empresaSlug/talentoNombre/fecha,
 * ni los campos evaluativos (puntajeIA, calificacionCeo, notasTix) que le
 * corresponden a la IA o al CEO, nunca al propio talento.
 */
export class RegistrarWorklogPropioDto {
  @IsEnum(TipoRegistroWorklog)
  tipo: TipoRegistroWorklog;

  // Checkin
  @IsOptional()
  @IsString()
  tareasPlanificadas?: string;

  // Checkout
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
}
