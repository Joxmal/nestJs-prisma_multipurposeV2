// src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../auth.service'; // Asegúrate que la ruta a JwtPayload es correcta
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  // Inyectamos el Reflector, que nos permite leer los metadatos de las rutas.
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos para la ruta.
    // Usamos 'getAllAndOverride' para buscar los metadatos tanto en el
    // manejador de la ruta (método del controlador) como en la clase del controlador.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene el decorador @Roles, no requiere ningún rol específico.
    // En este caso, permitimos el acceso.
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario de la solicitud.
    // En este punto, el AuthGuard ya se ha ejecutado y ha adjuntado
    // el usuario (payload del JWT) a la solicitud.
    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    // Si por alguna razón no hay usuario (esto no debería pasar si AuthGuard está antes),
    // denegamos el acceso.
    if (!user || !user.roles) {
      return false;
    }

    // 3. Comprobar si el usuario tiene al menos uno de los roles requeridos.
    // 'some' devuelve true tan pronto como encuentra una coincidencia.
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles.includes(role),
    );

    return hasRequiredRole;
  }
}
