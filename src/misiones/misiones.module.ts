import { Module } from '@nestjs/common';
import { MisionesController } from './misiones.controller';
import { MisionesService } from './misiones.service';
import { ProgresoModule } from '../progreso/progreso.module';

@Module({
  imports: [ProgresoModule],
  controllers: [MisionesController],
  providers: [MisionesService],
})
export class MisionesModule {}
