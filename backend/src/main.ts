import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SeedService } from './database/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Run database seeding on application load
  const seedService = app.get(SeedService);
  await seedService.seed();

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Backend is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
