import { Module } from '@nestjs/common';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { AnalisisEjecutivoService } from './analisis-ejecutivo.service';
import { MuralModule } from '../mural/mural.module';

@Module({
  imports: [MuralModule],
  controllers: [EmpresasController],
  providers: [EmpresasService, AnalisisEjecutivoService],
})
export class EmpresasModule {}
