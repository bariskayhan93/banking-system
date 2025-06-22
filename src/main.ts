import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Add validation pipe with detailed error messages for better API testing
  app.useGlobalPipes(
    new ValidationPipe({ 
      transform: true, 
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );
  
  // Enable CORS for Swagger UI
  app.enableCors();
  
  // Set up comprehensive Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Banking System API')
    .setDescription(`
      API for Banking System.
      
      ## Architecture
      - **PostgreSQL**: Stores core data (Persons, Bank Accounts, Transactions).
      - **Gremlin/TinkerGraph**: Stores only the social graph (Person-friendships).
      
      ## Features
      - Person and bank account management.
      - Transaction processing.
      - Calculation of net worth and loan potential.
    `)
    .setVersion('1.0')
    // Add useful tags for API organization
    .addTag('persons', 'Person management and friendship operations')
    .addTag('bank-accounts', 'Bank account management')
    .addTag('bank-transactions', 'Transaction management')
    .addTag('processes', 'System processes for calculations')
    .addTag('seed', 'Database seeding for testing')
    // Add security schemes for future authentication support
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Add Swagger UI at /api endpoint with enhanced options
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      tagsSorter: 'alpha'
    }
  });

  const host = process.env.HOST || '0.0.0.0';
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, host);
  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();
