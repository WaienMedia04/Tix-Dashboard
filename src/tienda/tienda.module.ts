import { Module } from '@nestjs/common';
import { TiendaController } from './tienda.controller';
import { TiendaService } from './tienda.service';
import { ProgresoModule } from '../progreso/progreso.module';

@Module({
  imports: [ProgresoModule],
  controllers: [TiendaController],
  providers: [TiendaService],
})
export class TiendaModule {}
