import { Module } from '@nestjs/common';
import { TalentosController } from './talentos.controller';
import { TalentosService } from './talentos.service';
import { CvExtractionService } from './cv-extraction.service';
import { WorklogsModule } from '../worklogs/worklogs.module';

@Module({
  imports: [WorklogsModule],
  controllers: [TalentosController],
  providers: [TalentosService, CvExtractionService],
})
export class TalentosModule {}
