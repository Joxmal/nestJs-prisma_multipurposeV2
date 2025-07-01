// src/prisma/prisma.module.ts

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 👈 ¡Importante! Hace el módulo disponible globalmente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 Exporta el servicio para que sea inyectable
})
export class PrismaModule {}
