import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CofreService } from './cofre.service';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestConActor } from '../auth/actor.types';

/** Autoservicio del cofre diario — siempre el propio, nunca el de otro talento. */
@Controller('talentos/me/cofre')
@UseGuards(SessionGuard)
export class CofreController {
  constructor(private readonly cofreService: CofreService) {}

  private exigirTalentoId(req: RequestConActor): {
    talentoId: string;
    empresaId: string;
  } {
    const actor = req.actor!;
    if (actor.type !== 'usuario' || !actor.usuario.talentoId) {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de empleado',
      );
    }
    return { talentoId: actor.usuario.talentoId, empresaId: actor.empresaId };
  }

  @Get()
  estado(@Req() req: RequestConActor) {
    const { talentoId } = this.exigirTalentoId(req);
    return this.cofreService.estadoHoy(talentoId);
  }

  @Post('abrir')
  abrir(@Req() req: RequestConActor) {
    const { talentoId, empresaId } = this.exigirTalentoId(req);
    return this.cofreService.abrir(empresaId, talentoId);
  }
}
