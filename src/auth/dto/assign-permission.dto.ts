// src/auth/dto/assign-permission.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({
    description: 'ID del usuario al que se le asignará/removerá el permiso',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID del permiso a asignar/remover',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  permissionId: number;
}
