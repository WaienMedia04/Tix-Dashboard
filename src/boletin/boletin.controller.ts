import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BoletinService } from './boletin.service';
import { CrearBoletinDto } from './dto/crear-boletin.dto';
import { ActualizarBoletinDto } from './dto/actualizar-boletin.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import type { RequestConActor } from '../auth/actor.types';

/**
 * Mural informativo — cualquier usuario logueado puede leerlo; publicar,
 * editar y borrar lo restringe BoletinService a CEO/RRHH.
 */
@Controller('empresas/:slug/boletin')
@UseGuards(CompanyAccessGuard)
export class BoletinController {
  constructor(private readonly boletinService: BoletinService) {}

  @Get()
  listar(
    @Param('slug') slug: string,
    @Query('cursorId') cursorId: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: RequestConActor,
  ) {
    return this.boletinService.listar(slug, req.actor!, {
      cursorId,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('hoy')
  hoy(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.boletinService.hoy(slug, req.actor!);
  }

  @Post()
  crear(
    @Param('slug') slug: string,
    @Body() dto: CrearBoletinDto,
    @Req() req: RequestConActor,
  ) {
    return this.boletinService.crear(slug, req.actor!, dto);
  }

  @Patch(':id')
  actualizar(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: ActualizarBoletinDto,
    @Req() req: RequestConActor,
  ) {
    return this.boletinService.actualizar(slug, req.actor!, id, dto);
  }

  @Delete(':id')
  borrar(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: RequestConActor,
  ) {
    return this.boletinService.borrar(slug, req.actor!, id);
  }
}
