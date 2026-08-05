import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import type { RequestConActor } from '../auth/actor.types';
import {
  CATEGORIAS_RANKING,
  PERIODOS_RANKING,
  type CategoriaRanking,
  type PeriodoRanking,
} from './rankings.constant';

// Ruta bajo /progreso/top (no /rankings) porque ':slug/rankings' ya existe
// en EmpresasController para el ranking de desempeño (puntajeIA) del panel
// admin — esta es la gamificación (XP, bitácoras, reconocimientos, racha).
@Controller('empresas/:slug/progreso/top')
@UseGuards(CompanyAccessGuard)
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get()
  top(
    @Param('slug') _slug: string,
    @Query('categoria') categoria: string | undefined,
    @Query('periodo') periodo: string | undefined,
    @Req() req: RequestConActor,
  ) {
    const categoriaValida = (categoria ?? 'xp') as CategoriaRanking;
    const periodoValido = (periodo ?? 'semanal') as PeriodoRanking;
    if (!CATEGORIAS_RANKING.includes(categoriaValida)) {
      throw new BadRequestException('Categoría de ranking inválida');
    }
    if (!PERIODOS_RANKING.includes(periodoValido)) {
      throw new BadRequestException('Período de ranking inválido');
    }
    return this.rankingsService.top(
      req.actor!.empresaId,
      categoriaValida,
      periodoValido,
    );
  }
}
