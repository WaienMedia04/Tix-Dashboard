import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PizarraService } from './pizarra.service';
import { CrearPostDto } from './dto/crear-post.dto';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ReaccionarDto } from './dto/reaccionar.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import type { RequestConActor } from '../auth/actor.types';

/**
 * Muro social compartido por toda la empresa — cualquier usuario logueado
 * puede publicar, reaccionar y comentar. PizarraService exige que sea una
 * cuenta humana, nunca tráfico de servicio de ClawLink.
 */
@Controller('empresas/:slug/pizarra')
@UseGuards(CompanyAccessGuard)
export class PizarraController {
  constructor(private readonly pizarraService: PizarraService) {}

  @Get('posts')
  listarPosts(
    @Param('slug') slug: string,
    @Query('cursorId') cursorId: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: RequestConActor,
  ) {
    return this.pizarraService.listarPosts(slug, req.actor!, {
      cursorId,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('posts')
  crearPost(
    @Param('slug') slug: string,
    @Body() dto: CrearPostDto,
    @Req() req: RequestConActor,
  ) {
    return this.pizarraService.crearPost(slug, req.actor!, dto);
  }

  @Delete('posts/:id')
  borrarPost(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: RequestConActor,
  ) {
    return this.pizarraService.borrarPost(slug, req.actor!, id);
  }

  @Post('posts/:id/reacciones')
  reaccionar(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: ReaccionarDto,
    @Req() req: RequestConActor,
  ) {
    return this.pizarraService.reaccionar(slug, req.actor!, id, dto);
  }

  @Post('posts/:id/comentarios')
  crearComentario(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: CrearComentarioDto,
    @Req() req: RequestConActor,
  ) {
    return this.pizarraService.crearComentario(slug, req.actor!, id, dto);
  }
}
