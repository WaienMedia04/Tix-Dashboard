import { Module } from '@nestjs/common';
import { PizarraController } from './pizarra.controller';
import { PizarraService } from './pizarra.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [PizarraController],
  providers: [PizarraService],
})
export class PizarraModule {}
