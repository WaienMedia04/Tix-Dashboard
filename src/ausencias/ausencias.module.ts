import { Module } from '@nestjs/common';
import { AusenciasController } from './ausencias.controller';
import { AusenciasService } from './ausencias.service';

@Module({
  controllers: [AusenciasController],
  providers: [AusenciasService],
})
export class AusenciasModule {}
