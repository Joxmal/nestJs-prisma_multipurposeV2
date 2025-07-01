import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '../../../src/common/enums/role.enum';

export class CreateUserByAdminDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role; // Opcional: el administrador puede asignar un rol específico
}
