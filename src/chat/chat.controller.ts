import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CrearConversacionDto } from './dto/crear-conversacion.dto';
import { EnviarMensajeDto } from './dto/enviar-mensaje.dto';
import { AgregarParticipantesDto } from './dto/agregar-participantes.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import type { RequestConActor } from '../auth/actor.types';

/**
 * Sin RolesGuard/@Roles: el chat interno es para cualquier usuario logueado
 * de la empresa (CEO, RRHH, Manager o Talento) — ChatService exige que sea
 * una cuenta humana, nunca tráfico de servicio de ClawLink.
 */
@Controller('empresas/:slug/chat')
@UseGuards(CompanyAccessGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('directorio')
  directorio(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.chatService.directorio(slug, req.actor!);
  }

  @Get('conversaciones')
  listarConversaciones(
    @Param('slug') slug: string,
    @Req() req: RequestConActor,
  ) {
    return this.chatService.listarConversaciones(slug, req.actor!);
  }

  @Get('conversaciones/resumen')
  resumen(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.chatService.resumen(slug, req.actor!);
  }

  @Post('conversaciones')
  crearConversacion(
    @Param('slug') slug: string,
    @Body() dto: CrearConversacionDto,
    @Req() req: RequestConActor,
  ) {
    return this.chatService.crearConversacion(slug, req.actor!, dto);
  }

  @Get('conversaciones/:id/mensajes')
  listarMensajes(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Query('antesDeId') antesDeId: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: RequestConActor,
  ) {
    return this.chatService.listarMensajes(slug, req.actor!, id, {
      antesDeId,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('conversaciones/:id/mensajes')
  enviarMensaje(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: EnviarMensajeDto,
    @Req() req: RequestConActor,
  ) {
    return this.chatService.enviarMensaje(slug, req.actor!, id, dto);
  }

  @Patch('conversaciones/:id/participantes')
  agregarParticipantes(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: AgregarParticipantesDto,
    @Req() req: RequestConActor,
  ) {
    return this.chatService.agregarParticipantes(slug, req.actor!, id, dto);
  }

  @Post('conversaciones/:id/eliminar')
  eliminarConversacion(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: RequestConActor,
  ) {
    return this.chatService.eliminarConversacion(slug, req.actor!, id);
  }
}
