import { Module } from '@nestjs/common';
import { AusenciasController } from './ausencias.controller';
import { AusenciasService } from './ausencias.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [AusenciasController],
  providers: [AusenciasService],
})
export class AusenciasModule {}
