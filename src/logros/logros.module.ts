import { Module } from '@nestjs/common';
import { LogrosService } from './logros.service';
import { ProgresoModule } from '../progreso/progreso.module';

@Module({
  imports: [ProgresoModule],
  providers: [LogrosService],
  exports: [LogrosService],
})
export class LogrosModule {}
