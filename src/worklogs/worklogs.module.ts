import { Module } from '@nestjs/common';
import { WorklogsController } from './worklogs.controller';
import { WorklogsService } from './worklogs.service';
import { ProgresoModule } from '../progreso/progreso.module';

@Module({
  imports: [ProgresoModule],
  controllers: [WorklogsController],
  providers: [WorklogsService],
  exports: [WorklogsService],
})
export class WorklogsModule {}
