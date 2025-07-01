// src/profile/profile.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { ProfileService } from './profile.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum'; // Importamos el enum de roles
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('profile')
@ApiBearerAuth('JWT-auth') // 👈 ¡CLAVE! Usa el mismo nombre que en main.ts
@Controller('profile')
// 👇 ¡Protección global! Todas las rutas aquí requerirán un token JWT válido.
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve los datos del perfil del usuario.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado (token inválido o no proporcionado).',
  })
  // Usamos nuestro decorador personalizado para obtener el payload del JWT
  async getMyProfile(@GetUser() user: JwtPayload) {
    // El payload (user) contiene el 'sub' (subject), que es el ID del usuario.
    // Pasamos ese ID a nuestro servicio para que busque los datos completos y seguros.
    return this.profileService.getUserProfile(user.sub);
  }

  // Ejemplo de una ruta protegida por Rol
  @Get('admin-data')
  @UseGuards(RolesGuard) // Aplicamos el guard de roles aquí
  @Roles(Role.ADMIN) // Especificamos que solo el rol 'ADMIN' puede acceder
  getAdminData(@GetUser() user: JwtPayload) {
    return {
      message: `Hola, admin ${user.username}! Estos son datos secretos.`,
      userPayload: user,
    };
  }
}
