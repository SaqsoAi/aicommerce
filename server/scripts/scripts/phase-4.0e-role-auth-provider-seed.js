const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const permissions = [
  ["auth.provider.manage", "Manage Auth Providers"],
  ["store.settings.manage", "Manage Store Settings"],
  ["store.settings.field.manage", "Manage Store Setting Fields"],
  ["ai.control.manage", "Manage AI Control Center"],
  ["integration.credentials.manage", "Manage Integration Credentials"],
  ["super.admin.control.manage", "Manage Super Admin Control Center"]
];

const authProviders = [
  {
    key: "EMAIL",
    name: "Email Login",
    enabled: true,
    required: true,
    configJson: {
      type: "email",
      passwordLogin: true,
      registerEnabled: true
    }
  },
  {
    key: "GOOGLE",
    name: "Google Login",
    enabled: false,
    required: false,
    configJson: {
      type: "oauth",
      envKeys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]
    }
  },
  {
    key: "FACEBOOK",
    name: "Facebook Login",
    enabled: false,
    required: false,
    configJson: {
      type: "oauth",
      envKeys: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"]
    }
  },
  {
    key: "PHONE_OTP",
    name: "Phone OTP Login",
    enabled: false,
    required: false,
    configJson: {
      type: "otp",
      phoneRequired: false
    }
  },
  {
    key: "GUEST_CHECKOUT",
    name: "Guest Checkout",
    enabled: true,
    required: false,
    configJson: {
      type: "checkout",
      allowGuestCheckout: true
    }
  }
];

async function main() {
  for (const [code, name] of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: { name },
      create: {
        code,
        name,
        description: "PHASE 4.0E Super Admin Control permission: " + name
      }
    });
  }

  const adminRoles = await prisma.role.findMany({
    where: {
      name: {
        in: ["SUPER_ADMIN", "ADMIN", "Super Admin", "Admin"]
      }
    }
  });

  for (const role of adminRoles) {
    for (const [code] of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code }
      });

      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }

  for (const provider of authProviders) {
    await prisma.authProvider.upsert({
      where: { key: provider.key },
      update: {
        name: provider.name,
        enabled: provider.enabled,
        required: provider.required,
        configJson: provider.configJson
      },
      create: provider
    });
  }

  console.log("PHASE 4.0E permissions and auth providers seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
