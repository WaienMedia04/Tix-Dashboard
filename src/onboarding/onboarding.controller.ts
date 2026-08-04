import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../admin/admin.guard';
import { OnboardingService } from './onboarding.service';
import { CrearSolicitudImplementacionDto } from './dto/crear-solicitud-implementacion.dto';
import { ActualizarEstadoSolicitudDto } from './dto/actualizar-estado-solicitud.dto';

@Controller()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /** Formulario público de onboarding — sin auth, la empresa todavía no existe. */
  @Post('onboarding')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  crear(@Body() dto: CrearSolicitudImplementacionDto) {
    return this.onboardingService.crear(dto);
  }

  @Get('admin/onboarding')
  @UseGuards(AdminGuard)
  listarAdmin() {
    return this.onboardingService.listarAdmin();
  }

  @Get('admin/onboarding/:id')
  @UseGuards(AdminGuard)
  obtenerAdmin(@Param('id') id: string) {
    return this.onboardingService.obtenerAdmin(id);
  }

  @Patch('admin/onboarding/:id/estado')
  @UseGuards(AdminGuard)
  actualizarEstadoAdmin(
    @Param('id') id: string,
    @Body() dto: ActualizarEstadoSolicitudDto,
  ) {
    return this.onboardingService.actualizarEstadoAdmin(id, dto);
  }
}
