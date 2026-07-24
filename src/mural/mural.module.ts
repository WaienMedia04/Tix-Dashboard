import { Module } from '@nestjs/common';
import { MuralController } from './mural.controller';
import { MuralService } from './mural.service';
import { MascotaChatService } from './mascota-chat.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [MuralController],
  providers: [MuralService, MascotaChatService],
  exports: [MuralService],
})
export class MuralModule {}
