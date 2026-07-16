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
import { NovedadesService } from './novedades.service';
import { CrearNovedadDto } from './dto/crear-novedad.dto';
import { NovedadesQueryDto } from './dto/novedades-query.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { RequestConActor } from '../auth/actor.types';

@Controller('empresas/:slug/novedades')
@UseGuards(CompanyAccessGuard, RolesGuard)
@Roles('CEO', 'RRHH')
export class NovedadesController {
  constructor(private readonly novedadesService: NovedadesService) {}

  @Get()
  listar(
    @Param('slug') slug: string,
    @Query() query: NovedadesQueryDto,
    @Req() req: RequestConActor,
  ) {
    return this.novedadesService.listar(slug, req.actor!, query);
  }

  @Post()
  crear(
    @Param('slug') slug: string,
    @Body() dto: CrearNovedadDto,
    @Req() req: RequestConActor,
  ) {
    return this.novedadesService.crear(slug, req.actor!, dto);
  }
}
