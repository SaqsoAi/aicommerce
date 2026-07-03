const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function upsertCredential(providerId, key, label, value, required = false) {
  await prisma.integrationCredential.upsert({
    where: { providerId_key: { providerId, key } },
    update: {
      label,
      encryptedValue: value || null,
      maskedValue: value ? "SET" : null,
      last4: value ? value.slice(-4) : null,
      isSet: Boolean(value),
      isEnabled: Boolean(value),
      isRequired: required,
      source: "CONTROL_CENTER",
    },
    create: {
      providerId,
      key,
      label,
      encryptedValue: value || null,
      maskedValue: value ? "SET" : null,
      last4: value ? value.slice(-4) : null,
      isSet: Boolean(value),
      isEnabled: Boolean(value),
      isRequired: required,
      source: "CONTROL_CENTER",
    },
  });
}

async function main() {
  const provider = await prisma.integrationProvider.upsert({
    where: { key: "WHATSAPP_META_CLOUD" },
    update: {
      name: "Meta WhatsApp Cloud API",
      category: "WHATSAPP",
      enabled: false,
      required: false,
      description: "Meta Cloud WhatsApp Business API for customer messaging campaigns.",
    },
    create: {
      key: "WHATSAPP_META_CLOUD",
      name: "Meta WhatsApp Cloud API",
      category: "WHATSAPP",
      enabled: false,
      required: false,
      description: "Meta Cloud WhatsApp Business API for customer messaging campaigns.",
    },
  });

  await upsertCredential(provider.id, "WHATSAPP_PROVIDER", "WhatsApp Provider", "META_CLOUD", true);
  await upsertCredential(provider.id, "WHATSAPP_PHONE_NUMBER_ID", "WhatsApp Phone Number ID", "", true);
  await upsertCredential(provider.id, "WHATSAPP_BUSINESS_ACCOUNT_ID", "WhatsApp Business Account ID", "", true);
  await upsertCredential(provider.id, "WHATSAPP_ACCESS_TOKEN", "WhatsApp Access Token", "", true);
  await upsertCredential(provider.id, "WHATSAPP_VERIFY_TOKEN", "WhatsApp Verify Token", "", false);
  await upsertCredential(provider.id, "WHATSAPP_TEMPLATE_NAMESPACE", "WhatsApp Template Namespace", "", false);

  const permissions = [
    ["messaging.center.manage", "Manage Messaging Center"],
    ["messaging.sms.send", "Send SMS Messages"],
    ["messaging.whatsapp.send", "Send WhatsApp Messages"],
    ["messaging.campaign.manage", "Manage Messaging Campaigns"],
    ["messaging.template.manage", "Manage Messaging Templates"],
    ["messaging.analytics.view", "View Messaging Analytics"],
  ];

  for (const [code, name] of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: { name },
      create: {
        code,
        name,
        description: "Enterprise Messaging Center permission: " + name,
      },
    });
  }

  const roles = await prisma.role.findMany({
    where: {
      name: {
        in: ["SUPER_ADMIN", "ADMIN", "Super Admin", "Admin"],
      },
    },
  });

  for (const role of roles) {
    for (const [code] of permissions) {
      const permission = await prisma.permission.findUnique({ where: { code } });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("Enterprise Messaging Center DB role seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
