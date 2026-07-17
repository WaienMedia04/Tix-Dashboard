import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const origenesPermitidos = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origen) => origen.trim())
    : ['http://localhost:3001'];
  app.enableCors({ origin: origenesPermitidos, credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
