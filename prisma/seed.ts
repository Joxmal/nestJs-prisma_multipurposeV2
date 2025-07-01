// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeding...');

  // Crear roles si no existen
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador del sistema con acceso total',
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Editor de contenido con permisos de creación y edición',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Usuario estándar con permisos básicos de lectura',
    },
  });

  console.log('Roles creados/actualizados:', {
    adminRole,
    editorRole,
    userRole,
  });

  // Crear permisos si no existen
  const readUsersPermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'read', subject: 'User' } },
    update: {},
    create: {
      action: 'read',
      subject: 'User',
      description: 'Permite leer información de usuarios',
    },
  });

  const manageUsersPermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'manage', subject: 'User' } },
    update: {},
    create: {
      action: 'manage',
      subject: 'User',
      description: 'Permite crear, actualizar y eliminar usuarios',
    },
  });

  const editUserPermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'edit', subject: 'User' } },
    update: {},
    create: {
      action: 'edit',
      subject: 'User',
      description: 'Permite editar User',
    },
  });

  const deleteUserPermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'delete', subject: 'User' } },
    update: {},
    create: {
      action: 'delete',
      subject: 'User',
      description: 'Permite eliminar User',
    },
  });

  const readProductsPermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'read', subject: 'Product' } },
    update: {},
    create: {
      action: 'read',
      subject: 'Product',
      description: 'Permite leer información de productos',
    },
  });

  const manageProductsPermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'manage', subject: 'Product' } },
    update: {},
    create: {
      action: 'manage',
      subject: 'Product',
      description: 'Permite crear, actualizar y eliminar productos',
    },
  });

  console.log('Permisos creados/actualizados:', {
    readUsersPermission,
    manageUsersPermission,
    editUserPermission,
    deleteUserPermission,
    readProductsPermission,
    manageProductsPermission,
  });

  // Nuevos permisos para artículos
  const createArticlePermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'create', subject: 'Article' } },
    update: {},
    create: {
      action: 'create',
      subject: 'Article',
      description: 'Permite crear artículos',
    },
  });

  const readArticlePermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'read', subject: 'Article' } },
    update: {},
    create: {
      action: 'read',
      subject: 'Article',
      description: 'Permite leer artículos',
    },
  });

  const editArticlePermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'edit', subject: 'Article' } },
    update: {},
    create: {
      action: 'edit',
      subject: 'Article',
      description: 'Permite editar artículos',
    },
  });

  const deleteArticlePermission = await prisma.permission.upsert({
    where: { action_subject: { action: 'delete', subject: 'Article' } },
    update: {},
    create: {
      action: 'delete',
      subject: 'Article',
      description: 'Permite eliminar artículos',
    },
  });

  console.log('Permisos de artículos creados/actualizados:', {
    createArticlePermission,
    readArticlePermission,
    editArticlePermission,
    deleteArticlePermission,
  });

  // Asignar permisos a roles
  // ADMIN: Todos los permisos (incluyendo los nuevos de artículos)
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: readUsersPermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: readUsersPermission.id },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: manageUsersPermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: manageUsersPermission.id },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: editUserPermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: editUserPermission.id },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: deleteUserPermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: deleteUserPermission.id },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: readProductsPermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: readProductsPermission.id },
  });

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: manageProductsPermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: manageProductsPermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: createArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: createArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: readArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: readArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: editArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: editArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: deleteArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: deleteArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: createArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: createArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: readArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: readArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: editArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: editArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: deleteArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: deleteArticlePermission.id },
  });
  console.log('Permisos asignados al rol ADMIN.');

  // EDITOR: Leer usuarios, gestionar productos, y gestionar artículos
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: editorRole.id,
        permissionId: readUsersPermission.id,
      },
    },
    update: {},
    create: { roleId: editorRole.id, permissionId: readUsersPermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: editorRole.id,
        permissionId: manageProductsPermission.id,
      },
    },
    update: {},
    create: {
      roleId: editorRole.id,
      permissionId: manageProductsPermission.id,
    },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: editorRole.id,
        permissionId: createArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: editorRole.id, permissionId: createArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: editorRole.id,
        permissionId: readArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: editorRole.id, permissionId: readArticlePermission.id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: editorRole.id,
        permissionId: editArticlePermission.id,
      },
    },
    update: {},
    create: { roleId: editorRole.id, permissionId: editArticlePermission.id },
  });
  console.log('Permisos asignados al rol EDITOR.');

  // USER: Leer productos
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: userRole.id,
        permissionId: readProductsPermission.id,
      },
    },
    update: {},
    create: { roleId: userRole.id, permissionId: readProductsPermission.id },
  });
  console.log('Permisos asignados al rol USER.');

  console.log('Seeding completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
