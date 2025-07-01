// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
// Importante: La ruta de importación ha cambiado por tu configuración en schema.prisma
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Llamamos al constructor de la clase padre (PrismaClient)
    super();
  }

  async onModuleInit() {
    // Nos conectamos a la base de datos al inicializar el módulo
    try {
      await this.$connect();
      console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      // Opcional: relanzar el error o manejarlo de otra manera
      throw error;
    }
  }
}
