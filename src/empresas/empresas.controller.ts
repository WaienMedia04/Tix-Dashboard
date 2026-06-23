import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { BitacorasQueryDto } from './dto/bitacoras-query.dto';
import { EmpleadoDetalleQueryDto } from './dto/empleado-detalle-query.dto';
import { KpisQueryDto } from './dto/kpis-query.dto';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  listar() {
    return this.empresasService.listar();
  }

  @Get(':slug/dashboard')
  dashboard(
    @Param('slug') slug: string,
    @Query('codigoAcceso') codigoAccesoQuery: string | undefined,
    @Headers('x-codigo-acceso') codigoAccesoHeader: string | undefined,
  ) {
    return this.empresasService.dashboard(
      slug,
      codigoAccesoQuery ?? codigoAccesoHeader,
    );
  }

  @Get(':slug/bitacoras')
  bitacoras(
    @Param('slug') slug: string,
    @Query() query: BitacorasQueryDto,
    @Query('codigoAcceso') codigoAccesoQuery: string | undefined,
    @Headers('x-codigo-acceso') codigoAccesoHeader: string | undefined,
  ) {
    return this.empresasService.bitacoras(
      slug,
      codigoAccesoQuery ?? codigoAccesoHeader,
      query,
    );
  }

  @Get(':slug/empleados')
  empleados(
    @Param('slug') slug: string,
    @Query('codigoAcceso') codigoAccesoQuery: string | undefined,
    @Headers('x-codigo-acceso') codigoAccesoHeader: string | undefined,
  ) {
    return this.empresasService.empleados(
      slug,
      codigoAccesoQuery ?? codigoAccesoHeader,
    );
  }

  @Get(':slug/empleados/:talentoId')
  empleadoDetalle(
    @Param('slug') slug: string,
    @Param('talentoId') talentoId: string,
    @Query() query: EmpleadoDetalleQueryDto,
    @Query('codigoAcceso') codigoAccesoQuery: string | undefined,
    @Headers('x-codigo-acceso') codigoAccesoHeader: string | undefined,
  ) {
    return this.empresasService.empleadoDetalle(
      slug,
      codigoAccesoQuery ?? codigoAccesoHeader,
      talentoId,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get(':slug/kpis')
  kpis(
    @Param('slug') slug: string,
    @Query() query: KpisQueryDto,
    @Query('codigoAcceso') codigoAccesoQuery: string | undefined,
    @Headers('x-codigo-acceso') codigoAccesoHeader: string | undefined,
  ) {
    return this.empresasService.kpis(
      slug,
      codigoAccesoQuery ?? codigoAccesoHeader,
      query,
    );
  }
}
