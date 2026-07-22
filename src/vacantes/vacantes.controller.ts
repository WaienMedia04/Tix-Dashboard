import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VacantesService } from './vacantes.service';
import { CrearVacanteDto } from './dto/crear-vacante.dto';
import { ActualizarVacanteDto } from './dto/actualizar-vacante.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { RequestConActor } from '../auth/actor.types';

/**
 * Vacantes — cualquier usuario logueado puede leerlas (los talentos las ven
 * en el mural informativo); publicar, editar, borrar y escanear candidatos
 * internos queda restringido a CEO/RRHH.
 */
@Controller('empresas/:slug/vacantes')
export class VacantesController {
  constructor(private readonly vacantesService: VacantesService) {}

  @Get()
  @UseGuards(CompanyAccessGuard)
  listar(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.vacantesService.listar(slug, req.actor!);
  }

  @Post()
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  crear(
    @Param('slug') slug: string,
    @Body() dto: CrearVacanteDto,
    @Req() req: RequestConActor,
  ) {
    return this.vacantesService.crear(slug, req.actor!, dto);
  }

  @Patch(':id')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  actualizar(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: ActualizarVacanteDto,
    @Req() req: RequestConActor,
  ) {
    return this.vacantesService.actualizar(slug, req.actor!, id, dto);
  }

  @Delete(':id')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  borrar(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: RequestConActor,
  ) {
    return this.vacantesService.borrar(slug, req.actor!, id);
  }

  @Post(':id/candidatos-internos')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  candidatosInternos(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: RequestConActor,
  ) {
    return this.vacantesService.candidatosInternos(slug, req.actor!, id);
  }
}
