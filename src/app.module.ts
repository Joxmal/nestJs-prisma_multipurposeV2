import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ArticlesModule } from './articles/articles.module'; // Importar ArticlesModule
import { ImagesModule } from './images/images.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el ConfigService esté disponible en toda la app
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(), // Valida que JWT_SECRET exista y sea un string
        JWT_EXPIRES_IN: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        MINIO_ROOT_USER: Joi.string().required(),
        MINIO_ROOT_PASSWORD: Joi.string().required(),
        MINIO_PORT: Joi.number().required(),
        MINIO_CONSOLE_PORT: Joi.number().required(),
        MINIO_PRIVATE_ENDPOINT: Joi.string().uri().required(),
        MINIO_PUBLIC_ENDPOINT: Joi.string().uri().required(),
        MINIO_BUCKET_NAME: Joi.string().required(),
      }),
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    ArticlesModule, // Añadir ArticlesModule
    ImagesModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'default',
        ttl: 10000,
        limit: 25,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
