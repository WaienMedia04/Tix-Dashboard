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
import { MuralService } from './mural.service';
import { ActualizarPerfilMuralDto } from './dto/actualizar-perfil-mural.dto';
import { CrearNotaDto } from './dto/crear-nota.dto';
import { ActualizarNotaDto } from './dto/actualizar-nota.dto';
import { ActualizarPosicionEstampaDto } from './dto/actualizar-posicion-estampa.dto';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestConActor } from '../auth/actor.types';

@Controller('talentos/me/mural')
@UseGuards(SessionGuard)
export class MuralController {
  constructor(private readonly muralService: MuralService) {}

  @Get()
  obtener(@Req() req: RequestConActor) {
    return this.muralService.obtenerMural(req.actor!);
  }

  @Patch('perfil')
  actualizarPerfil(
    @Body() dto: ActualizarPerfilMuralDto,
    @Req() req: RequestConActor,
  ) {
    return this.muralService.actualizarPerfil(req.actor!, dto);
  }

  @Post('notas')
  crearNota(@Body() dto: CrearNotaDto, @Req() req: RequestConActor) {
    return this.muralService.crearNota(req.actor!, dto);
  }

  @Patch('notas/:id')
  actualizarNota(
    @Param('id') id: string,
    @Body() dto: ActualizarNotaDto,
    @Req() req: RequestConActor,
  ) {
    return this.muralService.actualizarNota(req.actor!, id, dto);
  }

  @Delete('notas/:id')
  borrarNota(@Param('id') id: string, @Req() req: RequestConActor) {
    return this.muralService.borrarNota(req.actor!, id);
  }

  @Get('estampas')
  listarMisEstampas(@Req() req: RequestConActor) {
    return this.muralService.listarMisEstampas(req.actor!);
  }

  @Patch('estampas/:id')
  actualizarPosicionEstampa(
    @Param('id') id: string,
    @Body() dto: ActualizarPosicionEstampaDto,
    @Req() req: RequestConActor,
  ) {
    return this.muralService.actualizarPosicionEstampa(req.actor!, id, dto);
  }
}
