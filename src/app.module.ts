import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmpresasModule } from './empresas/empresas.module';
import { WorklogsModule } from './worklogs/worklogs.module';
import { TalentosModule } from './talentos/talentos.module';

@Module({
  imports: [PrismaModule, EmpresasModule, WorklogsModule, TalentosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
