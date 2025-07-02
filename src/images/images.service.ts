// src/images/images.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImagesService {
  private s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME')!;
    this.s3Client = new S3Client({
      region: 'us-east-1', // MinIO no usa la región, pero es requerida por el SDK
      endpoint: this.configService.get<string>('MINIO_ENDPOINT')!,
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ROOT_USER')!,
        secretAccessKey: this.configService.get<string>('MINIO_ROOT_PASSWORD')!,
      },
      forcePathStyle: true, // Importante para MinIO
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    companyId: number,
  ) {
    // Aseguramos que file.originalname sea tratado como string
    const filename = `${uuid()}-${String(file.originalname)}`;
    const fileBuffer = file.buffer;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: filename,
          Body: fileBuffer,
          ContentType: file.mimetype,
        }),
      );

      // La URL directa ya no es tan relevante si vamos a usar URLs pre-firmadas para el acceso
      // Sin embargo, la guardamos para referencia o si se cambia la política del bucket
      const imageUrl = `${this.configService.get<string>('MINIO_ENDPOINT')!}/${this.bucketName}/${filename}`;

      const image = await this.prisma.image.create({
        data: {
          filename: filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: imageUrl, // Guardamos la URL directa, aunque se usará una pre-firmada para el acceso
          userId: userId,
          companyId: companyId,
        },
      });

      return image;
    } catch (error) {
      console.error('Error al subir archivo a MinIO o guardar en DB:', error);
      throw new InternalServerErrorException(
        'Error al subir la imagen. Inténtalo de nuevo más tarde.',
      );
    }
  }

  async getFileUrl(imageId: number, companyId: number) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId, companyId: companyId },
    });

    if (!image) {
      throw new InternalServerErrorException('Imagen no encontrada.');
    }

    // Generar una URL pre-firmada para el acceso temporal al objeto
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: image.filename,
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // URL válida por 1 hora (en segundos)
      });
      return signedUrl;
    } catch (error) {
      console.error('Error al generar URL pre-firmada:', error);
      throw new InternalServerErrorException(
        'Error al obtener la URL de la imagen. Inténtalo de nuevo más tarde.',
      );
    }
  }
}
