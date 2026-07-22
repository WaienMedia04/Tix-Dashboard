import { Module } from '@nestjs/common';
import { PizarraController } from './pizarra.controller';
import { PizarraService } from './pizarra.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PizarraController],
  providers: [PizarraService],
})
export class PizarraModule {}
