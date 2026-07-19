import { Module } from '@nestjs/common';
import { EstampasController } from './estampas.controller';
import { EstampasService } from './estampas.service';

@Module({
  controllers: [EstampasController],
  providers: [EstampasService],
})
export class EstampasModule {}
