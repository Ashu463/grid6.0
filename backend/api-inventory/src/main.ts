import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { rateLimitMiddleware } from './utils/rate-limit.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Security Shield')
      .setDescription('Test out the demo APIs from following listed endpoints')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);
    fs.writeFileSync('./grid-BE-service.json', JSON.stringify(document, null, 2), {
      encoding: 'utf8',
    });
  }

  app.use(rateLimitMiddleware);
  const port = process.env.PORT ?? 9000;
  await app.listen(port, '0.0.0.0');
  console.log(`backend application is running on port ${port}`);
}
bootstrap();
