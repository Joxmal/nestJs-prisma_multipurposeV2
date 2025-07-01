// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // 👇 Solución aquí: Verifica la variable antes de usarla
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('La variable de entorno JWT_SECRET no está definida.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Ahora 'secret' es garantizado un 'string'
    });
  }

  async validate(payload: JwtPayload) {
    // ... tu lógica de validación sigue igual
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, companyId: payload.companyId },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Token inválido o el usuario ya no existe.',
      );
    }
    return payload;
  }
}
