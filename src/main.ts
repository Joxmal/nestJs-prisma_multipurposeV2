import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 👈 1. Importa el ValidationPipe
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Usa Pino como logger global
  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza un error si se envían propiedades no permitidas
      transform: true, // Transforma los datos de entrada a sus tipos de DTO (ej. string a number)
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    // 3. Configura el documento base de OpenAPI
    const config = new DocumentBuilder()
      .setTitle('Mi API de NestJS con Prisma')
      .setDescription(
        'Documentación interactiva de la API para pruebas y desarrollo.',
      )
      .setVersion('1.0')
      .addTag('auth', 'Operaciones de Autenticación')
      .addTag('profile', 'Operaciones de Perfil de Usuario')
      // 👇 4. Configuración para el Bearer Token (JWT)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Introduce el token JWT',
          in: 'header',
        },
        'JWT-auth', // Este nombre debe ser único y lo usaremos en el controlador
      )
      .build();

    // 5. Crea el documento OpenAPI a partir de la configuración y la app
    const document = SwaggerModule.createDocument(app, config);

    // 6. Configura la ruta donde se servirá la UI de Swagger
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        docExpansion: 'none', // 'list'
      },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
  const url = await app.getUrl();
  app.get(Logger).log(`Application is running on: ${url}`);

  if (process.env.NODE_ENV !== 'production') {
    app
      .get(Logger)
      .log(`Swagger UI available at: ${await app.getUrl()}/api-docs`);
  }
}
void bootstrap();
