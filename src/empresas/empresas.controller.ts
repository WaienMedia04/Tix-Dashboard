import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { BitacorasQueryDto } from './dto/bitacoras-query.dto';
import { EmpleadoDetalleQueryDto } from './dto/empleado-detalle-query.dto';
import { KpisQueryDto } from './dto/kpis-query.dto';
import { ReportesQueryDto } from './dto/reportes-query.dto';
import { CrearTalentoDto } from './dto/crear-talento.dto';
import { CrearUsuarioEmpresaDto } from './dto/crear-usuario-empresa.dto';
import { RankingsQueryDto } from './dto/rankings-query.dto';
import { CompanyAccessGuard } from '../auth/guards/company-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { RequestConActor } from '../auth/actor.types';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  listar(@Headers('x-admin-token') tokenAdmin: string | undefined) {
    if (!process.env.ADMIN_TOKEN || tokenAdmin !== process.env.ADMIN_TOKEN) {
      throw new UnauthorizedException('No autorizado');
    }
    return this.empresasService.listar();
  }

  @Get(':slug/dashboard')
  @UseGuards(CompanyAccessGuard)
  dashboard(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.empresasService.dashboard(slug, req.actor!);
  }

  @Get(':slug/bitacoras')
  @UseGuards(CompanyAccessGuard)
  bitacoras(
    @Param('slug') slug: string,
    @Query() query: BitacorasQueryDto,
    @Req() req: RequestConActor,
  ) {
    return this.empresasService.bitacoras(slug, req.actor!, query);
  }

  @Get(':slug/empleados')
  @UseGuards(CompanyAccessGuard)
  empleados(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.empresasService.empleados(slug, req.actor!);
  }

  @Get(':slug/empleados/:talentoId')
  @UseGuards(CompanyAccessGuard)
  empleadoDetalle(
    @Param('slug') slug: string,
    @Param('talentoId') talentoId: string,
    @Query() query: EmpleadoDetalleQueryDto,
    @Req() req: RequestConActor,
  ) {
    return this.empresasService.empleadoDetalle(
      slug,
      req.actor!,
      talentoId,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get(':slug/kpis')
  @UseGuards(CompanyAccessGuard)
  kpis(
    @Param('slug') slug: string,
    @Query() query: KpisQueryDto,
    @Req() req: RequestConActor,
  ) {
    return this.empresasService.kpis(slug, req.actor!, query);
  }

  @Get(':slug/reportes')
  @UseGuards(CompanyAccessGuard)
  reportes(
    @Param('slug') slug: string,
    @Query() query: ReportesQueryDto,
    @Req() req: RequestConActor,
  ) {
    return this.empresasService.reportes(slug, req.actor!, query);
  }

  @Get(':slug/rankings')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH', 'MANAGER')
  rankings(
    @Param('slug') slug: string,
    @Query() query: RankingsQueryDto,
    @Req() req: RequestConActor,
  ) {
    return this.empresasService.rankings(slug, req.actor!, query);
  }

  @Get(':slug/reportes-ejecutivos')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  reportesEjecutivos(
    @Param('slug') slug: string,
    @Query() query: ReportesQueryDto,
    @Req() req: RequestConActor,
  ) {
    return this.empresasService.reportesEjecutivos(slug, req.actor!, query);
  }

  @Get(':slug/alertas')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH', 'MANAGER')
  alertas(@Param('slug') slug: string, @Req() req: RequestConActor) {
    return this.empresasService.alertas(slug, req.actor!);
  }

  @Post(':slug/talentos')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  crearTalento(
    @Param('slug') slug: string,
    @Body() dto: CrearTalentoDto,
    @Req() req: RequestConActor,
  ) {
    return this.empresasService.crearTalento(slug, req.actor!, dto);
  }

  /** CEO/RRHH invitan a su propio talento a entrar a la plataforma. */
  @Post(':slug/usuarios')
  @UseGuards(CompanyAccessGuard, RolesGuard)
  @Roles('CEO', 'RRHH')
  crearUsuario(
    @Param('slug') slug: string,
    @Body() dto: CrearUsuarioEmpresaDto,
    @Req() req: RequestConActor,
  ) {
    return this.empresasService.crearUsuario(slug, req.actor!, dto);
  }
}
