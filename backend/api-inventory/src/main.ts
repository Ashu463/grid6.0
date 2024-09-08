import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  
  console.log(process.env.DATABASE_URL);
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://ashuk.ddns.net','http://ashuk.ddns.net'],  
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


  const config = new DocumentBuilder()
    .setTitle('API Security Shield')
    .setDescription('Test out the demo APIs from following listed endpoints')
    .setVersion('1.0')
    .addBearerAuth() // If you have authentication
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Set up Swagger UI
  SwaggerModule.setup('api', app, document);
  fs.writeFileSync('./grid-BE-service.json', JSON.stringify(document, null, 2), {
    encoding: 'utf8',
  });
  await app.listen(9000, '0.0.0.0');
  console.log("backend application is running on port 9000 edited by bonobo")

}
bootstrap();
