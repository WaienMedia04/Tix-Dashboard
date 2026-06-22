import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { EmpresasService } from './empresas.service';

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
    return this.empresasService.dashboard(slug, codigoAccesoQuery ?? codigoAccesoHeader);
  }
}
