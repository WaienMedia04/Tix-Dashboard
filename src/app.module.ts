import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmpresasModule } from './empresas/empresas.module';
import { WorklogsModule } from './worklogs/worklogs.module';
import { TalentosModule } from './talentos/talentos.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { NovedadesModule } from './novedades/novedades.module';
import { AusenciasModule } from './ausencias/ausencias.module';
import { EstampasModule } from './estampas/estampas.module';
import { MuralModule } from './mural/mural.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    PrismaModule,
    EmpresasModule,
    WorklogsModule,
    TalentosModule,
    AuthModule,
    AdminModule,
    NovedadesModule,
    AusenciasModule,
    EstampasModule,
    MuralModule,
    NotificacionesModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
