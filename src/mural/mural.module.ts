import { Module } from '@nestjs/common';
import { MuralController } from './mural.controller';
import { MuralService } from './mural.service';
import { MascotaChatService } from './mascota-chat.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { ProgresoModule } from '../progreso/progreso.module';
import { LogrosModule } from '../logros/logros.module';

@Module({
  imports: [NotificacionesModule, ProgresoModule, LogrosModule],
  controllers: [MuralController],
  providers: [MuralService, MascotaChatService],
  exports: [MuralService],
})
export class MuralModule {}
