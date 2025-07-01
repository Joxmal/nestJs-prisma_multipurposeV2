// src/auth/decorators/get-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../auth.service'; // Asegúrate que la ruta a JwtPayload es correcta
import { Request } from 'express';
/**
 * Decorador de parámetro personalizado para extraer el payload del usuario
 * del token JWT, que ha sido validado y adjuntado a la request
 * por el AuthGuard('jwt').
 */
export const GetUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    // 2. Extraemos la solicitud y la tipamos explícitamente como 'Request'
    const request: Request = ctx.switchToHttp().getRequest();

    // 3. Ahora TypeScript sabe que 'request.user' es una propiedad válida,
    //    aunque su tipo sigue siendo un poco vago (any o unknown por defecto
    //    en la definición de tipos de Express/Passport).
    const user = request.user as JwtPayload; // Mantenemos la aserción de tipo aquí
    // para ser súper explícitos sobre la forma del payload.

    return data ? user?.[data] : user;
  },
);
