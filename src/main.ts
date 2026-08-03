import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // El proxy del hosting agrega un hop antes de Express — sin esto,
  // req.ip (usado por el rate limiter) resuelve a la IP del proxy y agrupa
  // el tráfico de todos los tenants bajo un mismo límite.
  app.set('trust proxy', 1);

  app.use(helmet());

  const origenesPermitidos = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origen) => origen.trim())
    : ['http://localhost:3001'];
  app.enableCors({ origin: origenesPermitidos, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
