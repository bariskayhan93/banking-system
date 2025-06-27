import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4201',
      'https://banking-client-preview.bariskayhan.com',
      'https://banking-admin-preview.bariskayhan.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Banking System API')
    .setDescription(
      `
      API for Banking System.
      
      ## Architecture
      - **PostgreSQL**: Stores core data (Persons, Bank Accounts, Transactions)
      - **Gremlin/TinkerGraph**: Stores social graph (Person-friendships)
      
      ## Features
      - Person and bank account management
      - Transaction processing
      - Calculation of net worth and loan potential
    `,
    )
    .setVersion('1.0')
    .addTag('persons', 'Person management')
    .addTag('bank-accounts', 'Bank account management')
    .addTag('bank-transactions', 'Transaction management')
    .addTag('processes', 'System processes')
    .addTag('seed', 'Database seeding')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();
