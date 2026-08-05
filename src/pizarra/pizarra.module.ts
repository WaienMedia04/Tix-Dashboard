import { Module } from '@nestjs/common';
import { PizarraController } from './pizarra.controller';
import { PizarraService } from './pizarra.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { ProgresoModule } from '../progreso/progreso.module';

@Module({
  imports: [PrismaModule, NotificacionesModule, ProgresoModule],
  controllers: [PizarraController],
  providers: [PizarraService],
})
export class PizarraModule {}
