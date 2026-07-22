import { Module } from '@nestjs/common';
import { TalentosController } from './talentos.controller';
import { TalentosService } from './talentos.service';
import { CvExtractionService } from './cv-extraction.service';
import { CvComparacionService } from './cv-comparacion.service';
import { WorklogsModule } from '../worklogs/worklogs.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [WorklogsModule, NotificacionesModule],
  controllers: [TalentosController],
  providers: [TalentosService, CvExtractionService, CvComparacionService],
})
export class TalentosModule {}
