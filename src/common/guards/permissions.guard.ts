import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../../auth/auth.service'; // Asegúrate que la ruta a JwtPayload es correcta
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los permisos requeridos para la ruta.
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no tiene el decorador @Permissions, no requiere ningún permiso específico.
    // En este caso, permitimos el acceso.
    if (!requiredPermissions) {
      return true;
    }

    // 2. Obtener el usuario de la solicitud.
    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    // Si no hay usuario o no tiene permisos, denegamos el acceso.
    if (!user || !user.permissions) {
      return false;
    }

    // 3. Comprobar si el usuario tiene al menos uno de los permisos requeridos.
    const hasRequiredPermission = requiredPermissions.some((permission) =>
      user.permissions.includes(permission),
    );

    return hasRequiredPermission;
  }
}
