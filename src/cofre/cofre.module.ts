import { Module } from '@nestjs/common';
import { CofreController } from './cofre.controller';
import { CofreService } from './cofre.service';
import { ProgresoModule } from '../progreso/progreso.module';

@Module({
  imports: [ProgresoModule],
  controllers: [CofreController],
  providers: [CofreService],
})
export class CofreModule {}
