import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: '*',
    credentials: true,
  }));
  await app.listen(4000);
}
bootstrap();
