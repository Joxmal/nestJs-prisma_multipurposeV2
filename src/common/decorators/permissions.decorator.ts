import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorador para asignar permisos requeridos a un endpoint.
 * Ejemplo de uso: @Permissions('article:edit', 'user:create')
 * @param permissions - Una lista de cadenas de permisos (ej. 'subject:action').
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
