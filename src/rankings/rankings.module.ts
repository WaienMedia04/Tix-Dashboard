import { Module } from '@nestjs/common';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';
import { ResumenSemanalController } from './resumen-semanal.controller';
import { ResumenSemanalService } from './resumen-semanal.service';
import { ProgresoModule } from '../progreso/progreso.module';

@Module({
  imports: [ProgresoModule],
  controllers: [RankingsController, ResumenSemanalController],
  providers: [RankingsService, ResumenSemanalService],
})
export class RankingsModule {}
