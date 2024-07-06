import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import { logger } from './middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(logger);
  app.use(cookieParser(process.env.JWT_SECRET));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(4000);
}
bootstrap();
