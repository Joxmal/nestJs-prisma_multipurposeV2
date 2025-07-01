// src/profile/profile.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      // Es MUY IMPORTANTE seleccionar solo los campos que quieres devolver
      // para nunca exponer la contraseña u otros datos sensibles.
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        companyId: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Este caso es poco probable si el token es válido, pero es una buena práctica de seguridad.
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }
}
