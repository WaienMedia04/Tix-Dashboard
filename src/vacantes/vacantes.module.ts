import { Module } from '@nestjs/common';
import { VacantesController } from './vacantes.controller';
import { VacantesService } from './vacantes.service';
import { VacanteMatchingService } from './vacante-matching.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VacantesController],
  providers: [VacantesService, VacanteMatchingService],
})
export class VacantesModule {}
