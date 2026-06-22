import { Body, Controller, Post } from '@nestjs/common';
import { WorklogsService } from './worklogs.service';
import { CreateWorklogDto } from './dto/create-worklog.dto';

@Controller('worklogs')
export class WorklogsController {
  constructor(private readonly worklogsService: WorklogsService) {}

  @Post()
  create(@Body() dto: CreateWorklogDto) {
    return this.worklogsService.create(dto);
  }
}
