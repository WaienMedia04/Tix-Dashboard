import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import type { RequestConActor } from '../auth/actor.types';

/**
 * Sin RolesGuard/@Roles: visible a todos los roles (incl. TALENTO), la
 * visibilidad de cada notificación individual la resuelve el servicio.
 */
@Controller('empresas/:slug/notificaciones')
@UseGuards(CompanyAccessGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  listar(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.notificacionesService.listar(slug, req.actor!);
  }

  @Get('contador')
  contador(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.notificacionesService.contador(slug, req.actor!);
  }

  @Post(':id/leer')
  marcarLeida(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: RequestConActor,
  ) {
    return this.notificacionesService.marcarLeida(slug, req.actor!, id);
  }

  @Post('leer-todas')
  marcarTodasLeidas(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.notificacionesService.marcarTodasLeidas(slug, req.actor!);
  }
}
