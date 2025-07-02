// src/images/images.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadImageDto } from './dto/upload-image.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtPayload } from 'src/auth/auth.service';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Response } from 'express';

@ApiTags('images')
@Controller('images')
@UseGuards(AuthGuard('jwt'), PermissionsGuard) // Proteger todas las rutas del controlador
@ApiBearerAuth('JWT-auth')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @Permissions('create:Image') // Requiere el permiso 'create:Image'
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir una nueva imagen' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen a subir',
    type: UploadImageDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente.',
    schema: {
      example: {
        id: 1,
        filename: 'uuid-imagen.jpg',
        originalName: 'imagen.jpg',
        mimetype: 'image/jpeg',
        size: 12345,
        url: 'http://localhost:9000/nest-images/uuid-imagen.jpg',
        userId: 1,
        companyId: 1,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo no proporcionado o inválido.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (permisos insuficientes).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo.'); // Considerar usar BadRequestException
    }
    return this.imagesService.uploadFile(file, user.sub, user.companyId);
  }

  @Get(':id')
  @Permissions('read:Image') // Requiere el permiso 'read:Image'
  @ApiOperation({ summary: 'Obtener la URL de una imagen por su ID' })
  @ApiResponse({
    status: 200,
    description: 'URL de la imagen obtenida exitosamente.',
    schema: {
      example: { url: 'http://localhost:9000/nest-images/uuid-imagen.jpg' },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (permisos insuficientes).',
  })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getImage(
    @Param('id') id: string,
    @GetUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const imageId = parseInt(id, 10);
    if (isNaN(imageId)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'ID de imagen inválido.' });
    }
    const imageUrl = await this.imagesService.getFileUrl(
      imageId,
      user.companyId,
    );
    console.log(imageUrl);
    // Redirigir al cliente a la URL de MinIO
    return res.redirect(imageUrl);
  }
}
