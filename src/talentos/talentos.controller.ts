import {
  Body,
  Controller,
  Param,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TalentosService } from './talentos.service';
import { ActualizarTalentoDto } from './dto/actualizar-talento.dto';
import { ActualizarFotoDto } from './dto/actualizar-foto.dto';
import { ActualizarCvDto } from './dto/actualizar-cv.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { RequestConActor } from '../auth/actor.types';

@Controller('talentos')
export class TalentosController {
  constructor(private readonly talentosService: TalentosService) {}

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

  /**
   * Persiste la URL del CV (ya subido a Vercel Blob por el frontend) y
   * dispara la extracción de datos con IA. La UI que consume esto
   * (revisión de campos extraídos) llega en la fase de Configuración —
   * este endpoint es el pipeline de datos, no tiene UI todavía.
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
}
