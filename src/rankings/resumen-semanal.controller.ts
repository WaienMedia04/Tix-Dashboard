import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResumenSemanalService } from './resumen-semanal.service';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestConActor } from '../auth/actor.types';

/** Autoservicio: siempre el propio resumen, nunca el de otro talento. */
@Controller('talentos/me/resumen-semanal')
@UseGuards(SessionGuard)
export class ResumenSemanalController {
  constructor(private readonly resumenSemanalService: ResumenSemanalService) {}

  @Get()
  obtener(@Req() req: RequestConActor) {
    const actor = req.actor!;
    if (actor.type !== 'usuario' || !actor.usuario.talentoId) {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta de empleado',
      );
    }
    return this.resumenSemanalService.obtener(actor.usuario.talentoId);
  }
}
