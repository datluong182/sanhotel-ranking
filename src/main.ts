import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from "nestjs-pino";
import { AppModule } from './app.module';

const PORT = process.env.SERVER_PORT;

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const whitelist = [
    'http://localhost:8001',
    'http://localhost:3001',
    'http://localhost:3000',
    'http://139.59.192.14:3000',
    'http://139.59.192.14:8001',
    'http://ranking.sanhotelseries.com',
  ];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });
  const logger = app.get(Logger);

  app.useLogger(logger);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('APIs crawl score review')
    .setVersion('1.0')
    .addTag('object')
    .addTag('object-log')
    .addTag('response')
    .addTag('hotel')
    .addTag('review')
    .addTag('staff')
    .addTag('staff-log', 'archive')
    .addTag('competition')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(PORT);
  

  logger.verbose(`App started on port ${PORT} !`)
  
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
