import { Module } from '@nestjs/common';
import { NovedadesController } from './novedades.controller';
import { NovedadesService } from './novedades.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [NovedadesController],
  providers: [NovedadesService],
})
export class NovedadesModule {}
