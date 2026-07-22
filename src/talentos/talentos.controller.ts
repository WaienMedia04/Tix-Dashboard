import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TalentosService } from './talentos.service';
import { ActualizarTalentoDto } from './dto/actualizar-talento.dto';
import { ActualizarFotoDto } from './dto/actualizar-foto.dto';
import { ActualizarCarnetDto } from './dto/actualizar-carnet.dto';
import { ActualizarCvDto } from './dto/actualizar-cv.dto';
import { ActualizarCvDatosDto } from './dto/actualizar-cv-datos.dto';
import { CompararCvDto } from './dto/comparar-cv.dto';
import { RegistrarWorklogPropioDto } from './dto/registrar-worklog-propio.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { RequestConActor } from '../auth/actor.types';

@Controller('talentos')
export class TalentosController {
  constructor(private readonly talentosService: TalentosService) {}

  @Post('me/worklogs')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('TALENTO')
  registrarWorklogPropio(
    @Body() dto: RegistrarWorklogPropioDto,
    @Req() req: RequestConActor,
  ) {
    return this.talentosService.registrarWorklogPropio(req.actor!, dto);
  }

  @Put(':talentoId')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  actualizarEstado(
    @Param('talentoId') talentoId: string,
    @Body() dto: ActualizarTalentoDto,
    @Req() req: RequestConActor,
  ) {
    return this.talentosService.actualizarEstado(talentoId, req.actor!, dto);
  }

  @Patch(':talentoId/foto')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  actualizarFoto(
    @Param('talentoId') talentoId: string,
    @Body() dto: ActualizarFotoDto,
    @Req() req: RequestConActor,
  ) {
    return this.talentosService.actualizarFoto(talentoId, req.actor!, dto);
  }

  @Patch(':talentoId/carnet')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  actualizarCarnet(
    @Param('talentoId') talentoId: string,
    @Body() dto: ActualizarCarnetDto,
    @Req() req: RequestConActor,
  ) {
    return this.talentosService.actualizarCarnet(talentoId, req.actor!, dto);
  }

  /**
   * Persiste la URL del CV (ya subido a Vercel Blob por el frontend) y
   * dispara la extracción de datos con IA.
   */
  @Patch(':talentoId/cv')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  actualizarCv(
    @Param('talentoId') talentoId: string,
    @Body() dto: ActualizarCvDto,
    @Req() req: RequestConActor,
  ) {
    return this.talentosService.actualizarCv(talentoId, req.actor!, dto);
  }

  /** Corrección manual de los datos ya extraídos, sin releer el PDF. */
  @Patch(':talentoId/cv-datos')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  actualizarCvDatos(
    @Param('talentoId') talentoId: string,
    @Body() dto: ActualizarCvDatosDto,
    @Req() req: RequestConActor,
  ) {
    return this.talentosService.actualizarCvDatos(talentoId, req.actor!, dto);
  }

  /** Compara el CV ya extraído del talento contra una descripción de puesto pegada al vuelo. */
  @Post(':talentoId/comparar-cv')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  compararCv(
    @Param('talentoId') talentoId: string,
    @Body() dto: CompararCvDto,
    @Req() req: RequestConActor,
  ) {
    return this.talentosService.compararCv(talentoId, req.actor!, dto);
  }
}
