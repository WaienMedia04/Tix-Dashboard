import { Body, Controller, Post } from '@nestjs/common';
import { WorklogsService } from './worklogs.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('worklogs')
export class WorklogsController {
  constructor(private readonly worklogsService: WorklogsService) {}

  @Post('checkin')
  checkin(@Body() dto: CreateCheckinDto) {
    return this.worklogsService.checkin(dto);
  }

  @Post('checkout')
  checkout(@Body() dto: CreateCheckoutDto) {
    return this.worklogsService.checkout(dto);
  }
}
