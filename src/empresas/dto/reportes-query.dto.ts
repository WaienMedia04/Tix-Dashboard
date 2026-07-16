import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export type PeriodoReporte = 'mensual' | 'semanal' | 'anual' | 'personalizado';

export class ReportesQueryDto {
  @IsIn(['mensual', 'semanal', 'anual', 'personalizado'])
  periodo!: PeriodoReporte;

  /** Requerido salvo cuando periodo = 'personalizado'. */
  @IsOptional()
  @IsString()
  valor?: string;

  /** Solo cuando periodo = 'personalizado'. */
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
