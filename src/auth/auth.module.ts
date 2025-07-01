// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy'; // ¡No olvides crear este archivo!
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importa Config*
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigModule para que ConfigService esté disponible
      inject: [ConfigService], // Inyecta ConfigService en la fábrica
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Lee el secreto validado
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Registra la estrategia
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
