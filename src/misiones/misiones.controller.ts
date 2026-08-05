import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MisionesService } from './misiones.service';
import { ReclamarMisionDto } from './dto/reclamar-mision.dto';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestConActor } from '../auth/actor.types';

/** Autoservicio de misiones — siempre las del propio talento. */
@Controller('talentos/me/misiones')
@UseGuards(SessionGuard)
export class MisionesController {
  constructor(private readonly misionesService: MisionesService) {}

  private exigirTalentoId(req: RequestConActor): { talentoId: string; empresaId: string } {
    const actor = req.actor!;
    if (actor.type !== 'usuario' || !actor.usuario.talentoId) {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de empleado',
      );
    }
    return { talentoId: actor.usuario.talentoId, empresaId: actor.empresaId };
  }

  @Get()
  catalogo(@Req() req: RequestConActor) {
    const { talentoId } = this.exigirTalentoId(req);
    return this.misionesService.catalogo(talentoId);
  }

  @Post('reclamar')
  reclamar(@Body() dto: ReclamarMisionDto, @Req() req: RequestConActor) {
    const { talentoId, empresaId } = this.exigirTalentoId(req);
    return this.misionesService.reclamar(empresaId, talentoId, dto.misionId);
  }
}
