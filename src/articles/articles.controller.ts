import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtPayload } from 'src/auth/auth.service';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@Controller('articles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard) // Aplicar AuthGuard y PermissionsGuard a nivel de controlador
@ApiBearerAuth('JWT-auth')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo artículo' })
  @ApiResponse({ status: 201, description: 'Artículo creado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (permisos insuficientes).',
  })
  @Permissions('create:Article') // Requiere el permiso 'create:Article'
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.articlesService.create(createArticleDto, user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los artículos de la compañía' })
  @ApiResponse({ status: 200, description: 'Lista de artículos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @Permissions('read:Article') // Requiere el permiso 'read:Article'
  async findAll(@GetUser() user: JwtPayload) {
    return this.articlesService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un artículo por ID' })
  @ApiResponse({ status: 200, description: 'Artículo encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado.' })
  async findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.articlesService.findOne(+id, user.companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un artículo existente' })
  @ApiResponse({
    status: 200,
    description: 'Artículo actualizado exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (permisos insuficientes).',
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado.' })
  @Permissions('edit:Article') // Requiere el permiso 'edit:Article'
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.articlesService.update(+id, updateArticleDto, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un artículo' })
  @ApiResponse({ status: 204, description: 'Artículo eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (permisos insuficientes).',
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado.' })
  @Permissions('delete:Article') // Requiere el permiso 'delete:Article'
  async remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    await this.articlesService.remove(+id, user.companyId);
  }
}
