import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetImagesDto {
  @ApiPropertyOptional({
    description:
      'Lista de IDs de imágenes a recuperar. Si no se proporciona, se devolverán todas las imágenes.',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  ids?: number[];
}
