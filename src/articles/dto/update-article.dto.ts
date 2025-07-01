import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @ApiProperty({
    description: 'Título del artículo',
    maxLength: 255,
    example: 'Mi artículo actualizado',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'El título no puede exceder los 255 caracteres.' })
  title?: string;

  @ApiProperty({
    description: 'Contenido del artículo',
    example: 'Este es el contenido actualizado de mi artículo.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El contenido debe ser una cadena de texto.' })
  content?: string;
}
