import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from /uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      if (path.endsWith('.usdz')) {
        res.setHeader('Content-Type', 'model/vnd.usdz+zip');
      }
    }
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Increase payload size limit
  // An 8 MB image becomes roughly 10.7 MB after base64 encoding, plus JSON overhead.
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  // CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    process.env.CORS_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(','))
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin?.replace(/\/$/, '');
      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 SILKMOON Backend running on http://localhost:${port}/api/v1`);
  console.log(`🌐 CORS origins: ${allowedOrigins.join(', ') || '(none configured)'}`);
}
bootstrap();
