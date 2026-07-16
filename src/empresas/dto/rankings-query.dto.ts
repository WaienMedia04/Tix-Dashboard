import { IsIn, IsOptional, IsString } from 'class-validator';

export type PeriodoRanking = 'mensual' | 'anual' | 'historico';

export class RankingsQueryDto {
  @IsOptional()
  @IsIn(['mensual', 'anual', 'historico'])
  periodo?: PeriodoRanking;

  /** YYYY-MM para mensual, YYYY para anual. Ignorado para historico. */
  @IsOptional()
  @IsString()
  valor?: string;
}
