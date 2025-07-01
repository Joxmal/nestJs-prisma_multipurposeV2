// src/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum'; // Importamos el enum de roles

// Definimos una clave única para almacenar los metadatos de los roles.
// Esto evita colisiones con otros metadatos.
export const ROLES_KEY = 'roles';

/**
 * Decorador para asignar roles requeridos a un endpoint.
 * Ejemplo de uso: @Roles(Role.ADMIN, Role.EDITOR)
 * @param roles - Una lista de roles permitidos del enum Role.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
