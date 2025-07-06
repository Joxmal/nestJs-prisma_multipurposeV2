// prisma/seed.ts

import { PrismaClient, Permission, Role } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Definimos todos nuestros datos en un solo lugar.
// Esto hace que sea muy fácil añadir/quitar roles, permisos o cambiar asignaciones.
const seedData = {
  roles: [
    {
      name: 'ADMIN',
      description: 'Administrador del sistema con acceso total',
    },
    {
      name: 'EDITOR',
      description: 'Editor de contenido con permisos de creación y edición',
    },
    {
      name: 'USER',
      description: 'Usuario estándar con permisos básicos de lectura',
    },
  ],
  permissions: [
    // Permisos para 'User'
    {
      action: 'manage',
      subject: 'User',
      description:
        'Permite gestionar (crear, leer, actualizar, eliminar) usuarios',
    },
    {
      action: 'read',
      subject: 'User',
      description: 'Permite leer información de usuarios',
    },
    { action: 'edit', subject: 'User', description: 'Permite editar usuarios' },
    {
      action: 'delete',
      subject: 'User',
      description: 'Permite eliminar usuarios',
    },

    // Permisos para 'Product'
    {
      action: 'manage',
      subject: 'Product',
      description: 'Permite gestionar productos',
    },
    {
      action: 'read',
      subject: 'Product',
      description: 'Permite leer información de productos',
    },

    // Permisos para 'Article'
    {
      action: 'create',
      subject: 'Article',
      description: 'Permite crear artículos',
    },
    {
      action: 'read',
      subject: 'Article',
      description: 'Permite leer artículos',
    },
    {
      action: 'edit',
      subject: 'Article',
      description: 'Permite editar artículos',
    },
    {
      action: 'delete',
      subject: 'Article',
      description: 'Permite eliminar artículos',
    },

    // Permisos para 'Image'
    {
      action: 'create',
      subject: 'Image',
      description: 'Permite crear Imágenes',
    },
    { action: 'read', subject: 'Image', description: 'Permite leer Imágenes' },
    {
      action: 'edit',
      subject: 'Image',
      description: 'Permite editar Imágenes',
    },
    {
      action: 'delete',
      subject: 'Image',
      description: 'Permite eliminar Imágenes',
    },
  ],
  // 2. Mapeamos qué permisos tiene cada rol de forma declarativa.
  // Usamos un formato 'action:subject' para facilitar la búsqueda.
  rolePermissions: {
    ADMIN: [
      'manage:User',
      'read:User',
      'edit:User',
      'delete:User',
      'manage:Product',
      'read:Product',
      'create:Article',
      'read:Article',
      'edit:Article',
      'delete:Article',
      'create:Image',
      'read:Image',
      'edit:Image',
      'delete:Image',
    ],
    EDITOR: [
      'read:User',
      'manage:Product', // Nota: manage a menudo implica create, read, update, delete. Podrías simplificar si tu lógica lo permite.
      'create:Article',
      'read:Article',
      'edit:Article',
    ],
    USER: ['read:Product'],
  },
};

async function main() {
  console.log('Iniciando el seeding...');

  // 3. Usamos una transacción para asegurar la atomicidad de la operación.
  // Si algo falla, todo se revierte.
  await prisma.$transaction(async (tx) => {
    // Crear Roles
    const createdRoles = new Map<string, Role>();
    for (const role of seedData.roles) {
      const newRole = await tx.role.upsert({
        where: { name: role.name },
        update: {},
        create: role,
      });
      createdRoles.set(role.name, newRole);
      console.log(`Rol creado/actualizado: ${newRole.name}`);
    }

    // Crear Permisos
    const createdPermissions = new Map<string, Permission>();
    for (const permission of seedData.permissions) {
      const newPermission = await tx.permission.upsert({
        where: {
          action_subject: {
            action: permission.action,
            subject: permission.subject,
          },
        },
        update: {},
        create: permission,
      });
      // Guardamos el permiso con una clave única para encontrarlo fácilmente después.
      const permissionKey = `${permission.action}:${permission.subject}`;
      createdPermissions.set(permissionKey, newPermission);
      console.log(`Permiso creado/actualizado: ${permissionKey}`);
    }

    // Asignar Permisos a Roles
    for (const [roleName, permissionKeys] of Object.entries(
      seedData.rolePermissions,
    )) {
      const role = createdRoles.get(roleName);
      if (!role) {
        console.warn(
          `Rol "${roleName}" no encontrado. Saltando asignación de permisos.`,
        );
        continue;
      }

      for (const permissionKey of permissionKeys) {
        const permission = createdPermissions.get(permissionKey);
        if (!permission) {
          console.warn(
            `Permiso "${permissionKey}" no encontrado. Saltando asignación.`,
          );
          continue;
        }

        await tx.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: { roleId: role.id, permissionId: permission.id },
        });
      }
      console.log(`Permisos asignados/actualizados para el rol: ${role.name}`);
    }
  });

  console.log('Seeding completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el proceso de seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
