// src/auth/dto/login.dto.ts

import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 Importa ApiProperty

export class LoginDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Nombre de usuario único para la compañía',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la compañía a la que pertenece el usuario',
  })
  @IsNumber()
  companyId: number;
}
