import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TiendaService } from './tienda.service';
import { ComprarItemDto } from './dto/comprar-item.dto';
import { EquiparItemDto } from './dto/equipar-item.dto';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestConActor } from '../auth/actor.types';

/** Autoservicio de la Tienda Virtual — siempre la del propio talento. */
@Controller('talentos/me/tienda')
@UseGuards(SessionGuard)
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

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
    return this.tiendaService.catalogo(talentoId);
  }

  @Post('comprar')
  comprar(@Body() dto: ComprarItemDto, @Req() req: RequestConActor) {
    const { talentoId, empresaId } = this.exigirTalentoId(req);
    return this.tiendaService.comprar(empresaId, talentoId, dto.itemId);
  }

  @Post('equipar')
  equipar(@Body() dto: EquiparItemDto, @Req() req: RequestConActor) {
    const { talentoId, empresaId } = this.exigirTalentoId(req);
    return this.tiendaService.equipar(
      empresaId,
      talentoId,
      dto.tipo,
      dto.itemId ?? null,
    );
  }
}
