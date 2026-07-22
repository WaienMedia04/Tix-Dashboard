import { Module } from '@nestjs/common';
import { BoletinController } from './boletin.controller';
import { BoletinService } from './boletin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BoletinController],
  providers: [BoletinService],
})
export class BoletinModule {}
