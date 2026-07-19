import { Module } from '@nestjs/common';
import { EstampasController } from './estampas.controller';
import { EstampasService } from './estampas.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [EstampasController],
  providers: [EstampasService],
})
export class EstampasModule {}
