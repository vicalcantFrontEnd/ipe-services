import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
    { bufferLogs: true },
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('app.PORT', 3000);
  const corsOrigins = config.get<string>('app.CORS_ORIGINS', 'http://localhost:3000');

  // Global prefix and versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Security
  await app.register(helmet as never);
  app.enableCors({
    origin: corsOrigins.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Swagger
  {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('IPE Services API')
      .setDescription('API del Instituto de Psicología y Educación')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios')
      .addTag('patients', 'Gestión de pacientes')
      .addTag('appointments', 'Gestión de citas')
      .addTag('clinical-records', 'Registros clínicos')
      .addTag('programs', 'Programas educativos')
      .addTag('enrollments', 'Inscripciones')
      .addTag('billing', 'Facturación y pagos')
      .addTag('health', 'Health checks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`IPE Services running on port ${port}`);
  new Logger('Bootstrap').log(`Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap();
