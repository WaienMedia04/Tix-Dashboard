import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EstampasService } from './estampas.service';
import { CrearEstampaDefinicionDto } from './dto/crear-estampa-definicion.dto';
import { ActualizarEstampaDefinicionDto } from './dto/actualizar-estampa-definicion.dto';
import { OtorgarEstampaDto } from './dto/otorgar-estampa.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { RequestConActor } from '../auth/actor.types';

@Controller('empresas/:slug/estampas')
@UseGuards(CompanyAccessGuard, RolesGuard)
@Roles('CEO', 'RRHH')
export class EstampasController {
  constructor(private readonly estampasService: EstampasService) {}

  @Get()
  listar(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.estampasService.listar(slug, req.actor!);
  }

  @Post()
  crear(
    @Param('slug') slug: string,
    @Body() dto: CrearEstampaDefinicionDto,
    @Req() req: RequestConActor,
  ) {
    return this.estampasService.crear(slug, req.actor!, dto);
  }

  @Patch(':id')
  actualizar(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: ActualizarEstampaDefinicionDto,
    @Req() req: RequestConActor,
  ) {
    return this.estampasService.actualizar(slug, req.actor!, id, dto);
  }

  @Post(':id/otorgar')
  otorgar(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: OtorgarEstampaDto,
    @Req() req: RequestConActor,
  ) {
    return this.estampasService.otorgar(slug, req.actor!, id, dto);
  }
}
