import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Título del artículo',
    maxLength: 255,
    example: 'Mi primer artículo',
  })
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MaxLength(255, { message: 'El título no puede exceder los 255 caracteres.' })
  title: string;

  @ApiProperty({
    description: 'Contenido del artículo',
    example: 'Este es el contenido de mi primer artículo.',
  })
  @IsString({ message: 'El contenido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El contenido no puede estar vacío.' })
  content: string;
}
