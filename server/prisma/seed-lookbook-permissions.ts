import prisma from "../src/config/prisma";

async function main() {
  const permissions = [
    {
      name: "LOOKBOOK_READ",
      description: "Can read lookbook content",
    },
    {
      name: "LOOKBOOK_MANAGE",
      description: "Can create, update, publish, and delete lookbooks",
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  const adminRoles = ["SUPER_ADMIN", "ADMIN"];

  for (const roleName of adminRoles) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) continue;

    for (const permission of permissions) {
      const dbPermission = await prisma.permission.findUnique({
        where: { name: permission.name },
      });

      if (!dbPermission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: dbPermission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: dbPermission.id,
        },
      });
    }
  }

  console.log("LOOKBOOK permissions seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
