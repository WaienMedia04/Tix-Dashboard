import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AusenciasService } from './ausencias.service';
import { CrearAusenciaDto } from './dto/crear-ausencia.dto';
import { AusenciasQueryDto } from './dto/ausencias-query.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { RequestConActor } from '../auth/actor.types';

@Controller('empresas/:slug/ausencias')
@UseGuards(CompanyAccessGuard, RolesGuard)
@Roles('CEO', 'RRHH')
export class AusenciasController {
  constructor(private readonly ausenciasService: AusenciasService) {}

  @Get()
  listar(
    @Param('slug') slug: string,
    @Query() query: AusenciasQueryDto,
    @Req() req: RequestConActor,
  ) {
    return this.ausenciasService.listar(slug, req.actor!, query);
  }

  @Post()
  crear(
    @Param('slug') slug: string,
    @Body() dto: CrearAusenciaDto,
    @Req() req: RequestConActor,
  ) {
    return this.ausenciasService.crear(slug, req.actor!, dto);
  }
}
