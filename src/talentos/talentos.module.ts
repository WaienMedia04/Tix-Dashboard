import { Module } from '@nestjs/common';
import { TalentosController } from './talentos.controller';
import { TalentosService } from './talentos.service';
import { CvExtractionService } from './cv-extraction.service';

@Module({
  controllers: [TalentosController],
  providers: [TalentosService, CvExtractionService],
})
export class TalentosModule {}
