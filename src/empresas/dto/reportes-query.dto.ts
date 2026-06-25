import { IsIn, IsString } from 'class-validator';

export type PeriodoReporte = 'mensual' | 'semanal';

export class ReportesQueryDto {
  @IsIn(['mensual', 'semanal'])
  periodo!: PeriodoReporte;

  @IsString()
  valor!: string;
}
