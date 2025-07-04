import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3LogsService {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3LogsService.name);
  private readonly bucketName: string;
  private readonly logsDirectory: string = path.join(process.cwd(), 'logs');

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'us-east-1', // MinIO no usa la región, pero es requerida por el SDK
      endpoint: this.configService.get<string>('MINIO_PRIVATE_ENDPOINT')!, // Usar el endpoint público de MinIO
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ROOT_USER')!,
        secretAccessKey: this.configService.get<string>('MINIO_ROOT_PASSWORD')!,
      },
      forcePathStyle: true, // Importante para MinIO
    });
    this.bucketName = 'logs'; // El nombre del bucket es "logs" como se especificó
  }

  @Cron(CronExpression.EVERY_30_MINUTES) // Se ejecuta todos los días a medianoche
  async handleCron() {
    this.logger.log('Iniciando la subida de logs a S3 (MinIO)...');
    try {
      await this.uploadLogsToS3();
      this.logger.log('Proceso de subida de logs a S3 (MinIO) completado.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          'Error al subir los logs a S3 (MinIO):',
          error.message,
        );
      } else {
        this.logger.error('Error desconocido al subir los logs a S3 (MinIO).');
      }
    }
  }

  private async uploadLogsToS3() {
    if (!fs.existsSync(this.logsDirectory)) {
      this.logger.warn(
        `El directorio de logs no existe: ${this.logsDirectory}`,
      );
      return;
    }

    const files = fs.readdirSync(this.logsDirectory);
    for (const file of files) {
      if (file === '.gitkeep') {
        continue; // Ignorar el archivo .gitkeep
      }

      const filePath = path.join(this.logsDirectory, file);
      const fileContent = fs.readFileSync(filePath);
      const s3Key = `daily-logs/${new Date().toISOString().split('T')[0]}/${file}`; // Organizar por fecha

      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: fileContent,
          ContentType: 'text/plain', // Asumiendo que los logs son texto plano
        });

        try {
          await this.s3Client.send(
            new HeadObjectCommand({ Bucket: this.bucketName, Key: s3Key }),
          );
          this.logger.log(
            `Archivo ${file} ya existe en S3 como ${s3Key}. Saltando subida.`,
          );
        } catch (headError: unknown) {
          // Verificar si headError es un objeto y tiene la propiedad 'name'
          const isNotFoundError =
            typeof headError === 'object' &&
            headError !== null &&
            'name' in headError &&
            (headError as { name: string }).name === 'NotFound';
          const isNoSuchKeyError =
            typeof headError === 'object' &&
            headError !== null &&
            'name' in headError &&
            (headError as { name: string }).name === 'NoSuchKey';

          if (isNotFoundError || isNoSuchKeyError) {
            await this.s3Client.send(command);
            this.logger.log(
              `Archivo ${file} subido a S3 (MinIO) como ${s3Key}`,
            );
          } else if (headError instanceof Error) {
            this.logger.error(
              `Error al verificar existencia de ${file} en S3:`,
              headError.message,
            );
          } else {
            this.logger.error(
              `Error desconocido al verificar existencia de ${file} en S3.`,
            );
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logger.error(
            `Error general al procesar el archivo ${file}:`,
            error.message,
          );
        } else {
          this.logger.error(
            `Error desconocido general al procesar el archivo ${file}.`,
          );
        }
      }
    }
  }
}
