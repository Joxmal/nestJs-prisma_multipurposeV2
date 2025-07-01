// src/auth/auth.service.ts

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
// Importa Prisma para acceder a sus tipos de utilidad
import { Prisma } from '@prisma/client';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto'; // Importar el nuevo DTO
import { Role } from '../common/enums/role.enum'; // Importar el enum Role

// 1. Interfaz para el payload del JWT. Correcta como la tienes.
export interface JwtPayload {
  sub: number;
  username: string;
  companyId: number;
  roles: Role[]; // Cambiado a Role[] para seguridad de tipos
  permissions: string[];
}

// 2. Definimos la estructura de la consulta con el validador de Prisma.
//    Esto nos asegura que nuestro 'include' es sintácticamente correcto.
const userWithRolesAndPermissions = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    },
  },
});

// 3. Creamos un nuevo tipo usando el validador anterior.
//    Este tipo `UserWithDetails` tendrá la forma exacta de nuestro resultado de la consulta.
type UserWithDetails = Prisma.UserGetPayload<
  typeof userWithRolesAndPermissions
>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { companyName, email, username, password, name } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'ADMIN' },
    });
    if (!adminRole) {
      throw new NotFoundException(
        'El rol "ADMIN" no fue encontrado. Por favor, créalo.',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: { name: companyName },
        });

        const user = await tx.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            name,
            companyId: company.id,
            roles: {
              create: [{ roleId: adminRole.id }],
            },
          },
        });

        const { password: _, ...result } = user;
        return result;
      });
    } catch (error) {
      // Manejo de errores de constraint único (email o companyId+username)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'El email o el nombre de usuario para esta compañía ya existen.',
          );
        }
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { username, password, companyId } = loginDto;

    // 4. Usamos nuestro validador y nuestro tipo para la consulta.
    const user: UserWithDetails | null = await this.prisma.user.findUnique({
      where: {
        // La sintaxis para un índice único compuesto es `fieldName_fieldName`
        companyId_username: {
          companyId,
          username,
        },
      },
      ...userWithRolesAndPermissions, // Incluimos las relaciones
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // --- Estas líneas ahora son 100% seguras y con autocompletado ---
    const roles: Role[] = user.roles.map(
      (userRole) => userRole.role.name as Role,
    ); // Casteamos a Role

    const permissions = [
      ...new Set(
        user.roles.flatMap((userRole) =>
          userRole.role.permissions.map(
            (p) => `${p.permission.action}:${p.permission.subject}`,
          ),
        ),
      ),
    ];
    // --- Fin de las líneas seguras ---

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      username: user.username,
      companyId: user.companyId,
      roles: roles,
      permissions: permissions,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async assignRoleToUser(
    userId: number,
    roleId: number,
    adminUser: JwtPayload,
  ): Promise<void> {
    // Verificar si el usuario y el rol existen
    const user = await this.prisma.user.findUnique({
      where: { id: userId, companyId: adminUser.companyId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado.`);
    }

    // Verificar si el usuario ya tiene el rol
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new ConflictException(
        `El usuario con ID ${userId} ya tiene el rol con ID ${roleId}.`,
      );
    }

    // Asignar el rol al usuario
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeRoleFromUser(
    userId: number,
    roleId: number,
    adminUser: JwtPayload,
  ): Promise<void> {
    // Verificar si el usuario y el rol existen
    const user = await this.prisma.user.findUnique({
      where: { id: userId, companyId: adminUser.companyId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado.`);
    }

    // Verificar si el usuario tiene el rol
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!existingUserRole) {
      throw new NotFoundException(
        `El usuario con ID ${userId} no tiene el rol con ID ${roleId}.`,
      );
    }

    // Eliminar el rol del usuario
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  async registerUserByAdmin(
    createUserDto: CreateUserByAdminDto,
    adminCompanyId: number,
  ) {
    const { username, email, password, name, role } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar el rol por defecto (USER) o el rol especificado por el administrador
    const defaultRole = await this.prisma.role.findUnique({
      where: { name: role || Role.USER }, // Si no se especifica, usa USER
    });

    if (!defaultRole) {
      throw new NotFoundException(
        `El rol "${role || Role.USER}" no fue encontrado.`,
      );
    }

    try {
      const newUser = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          name,
          companyId: adminCompanyId, // Asignar a la compañía del administrador
          roles: {
            create: [{ roleId: defaultRole.id }],
          },
        },
      });

      const { password: _, ...result } = newUser;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'El email o el nombre de usuario ya existen en esta compañía.',
          );
        }
      }
      throw error;
    }
  }
}
