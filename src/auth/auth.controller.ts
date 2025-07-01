// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AssignRoleDto } from './dto/assign-role.dto'; // Importar el nuevo DTO
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger'; // Importar ApiBearerAuth
import { AuthGuard } from '@nestjs/passport'; // Importar AuthGuard
import { RolesGuard } from './guards/roles.guard'; // Importar RolesGuard
import { Roles } from './decorators/roles.decorator'; // Importar Roles decorator
import { Role } from '../common/enums/role.enum'; // Importar el enum Role
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto'; // Importar el nuevo DTO
import { GetUser } from './decorators/get-user.decorator'; // Importar GetUser decorator
import { JwtPayload } from './auth.service'; // Importar JwtPayload

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // Inyectamos el AuthService para poder usar sus métodos
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para registrar una nueva compañía y su usuario administrador.
   * POST /auth/register
   */
  @Post('register')
  @ApiOperation({
    summary: 'Registrar una nueva compañía y usuario administrador',
  })
  @ApiResponse({ status: 201, description: 'Registro exitoso.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'El email o usuario ya existe.' })
  async register(@Body() registerDto: RegisterDto) {
    // Simplemente llamamos al método del servicio, que contiene toda la lógica.
    // El servicio se encarga de las transacciones, hashing y manejo de errores.
    const newUser = await this.authService.register(registerDto);

    // Devolvemos el usuario creado (sin la contraseña) como confirmación.
    return {
      message: 'Registro exitoso. Ahora puedes iniciar sesión.',
      user: newUser,
    };
  }

  /**
   * Endpoint para que un usuario inicie sesión.
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión para obtener un token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso, devuelve el token de acceso.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    // El servicio de login valida las credenciales y genera el token JWT.
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint para asignar un rol a un usuario.
   * Requiere autenticación y el rol 'ADMIN'.
   * POST /auth/assign-role
   */
  @Post('assign-role')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para operaciones exitosas sin retorno de datos
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Proteger con JWT y RolesGuard
  @Roles(Role.ADMIN) // Solo usuarios con rol 'ADMIN' pueden acceder
  @ApiBearerAuth('JWT-auth') // Documentar que requiere un token JWT
  @ApiOperation({ summary: 'Asignar un rol a un usuario' })
  @ApiResponse({ status: 204, description: 'Rol asignado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (rol insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene el rol asignado.',
  })
  async assignRole(
    @Body() assignRoleDto: AssignRoleDto,
    @GetUser() adminUser: JwtPayload,
  ): Promise<void> {
    await this.authService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
      adminUser,
    );
  }

  /**
   * Endpoint para remover un rol de un usuario.
   * Requiere autenticación y el rol 'ADMIN'.
   * POST /auth/remove-role
   */
  @Post('remove-role')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para operaciones exitosas sin retorno de datos
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Proteger con JWT y RolesGuard
  @Roles(Role.ADMIN) // Solo usuarios con rol 'ADMIN' pueden acceder
  @ApiBearerAuth('JWT-auth') // Documentar que requiere un token JWT
  @ApiOperation({ summary: 'Remover un rol de un usuario' })
  @ApiResponse({ status: 204, description: 'Rol removido exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (rol insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado.' })
  async removeRole(
    @Body() assignRoleDto: AssignRoleDto,
    @GetUser() adminUser: JwtPayload,
  ): Promise<void> {
    await this.authService.removeRoleFromUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
      adminUser,
    );
  }

  /**
   * Endpoint para que un administrador registre un nuevo usuario normal
   * y lo asigne a su propia compañía.
   * POST /auth/admin/register-user
   */
  @Post('admin/register-user')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Proteger con JWT y RolesGuard
  @Roles(Role.ADMIN) // Solo usuarios con rol 'ADMIN' pueden acceder
  @ApiBearerAuth('JWT-auth') // Documentar que requiere un token JWT
  @ApiOperation({
    summary: 'Registrar un nuevo usuario por un administrador',
    description:
      'Solo administradores pueden registrar nuevos usuarios y asignarlos a su compañía.',
  })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (rol insuficiente).',
  })
  @ApiResponse({ status: 409, description: 'El email o usuario ya existe.' })
  async registerUserByAdmin(
    @Body() createUserDto: CreateUserByAdminDto,
    @GetUser() adminUser: JwtPayload, // Obtener el payload del administrador
  ) {
    const newUser = await this.authService.registerUserByAdmin(
      createUserDto,
      adminUser.companyId, // Pasar el ID de la compañía del administrador
    );

    return {
      message: 'Usuario registrado exitosamente por el administrador.',
      user: newUser,
    };
  }
}
