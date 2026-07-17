const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const secret =
  process.env.ENCRYPTION_KEY ||
  process.env.CONTROL_CENTER_SECRET ||
  process.env.JWT_SECRET ||
  "ai-commerce-control-center-dev-secret-32";

const key = crypto.createHash("sha256").update(secret).digest();

function encryptValue(value) {
  if (!value) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

function mask(value) {
  if (!value) return null;
  return "****" + value.slice(-4);
}

async function upsertCredential(providerId, key, label, value, required = true) {
  await prisma.integrationCredential.upsert({
    where: {
      providerId_key: {
        providerId,
        key,
      },
    },
    update: {
      label,
      encryptedValue: encryptValue(value),
      maskedValue: mask(value),
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
      encryptedValue: encryptValue(value),
      maskedValue: mask(value),
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
      enabled: true,
      required: false,
      description: "Meta WhatsApp Cloud API for customer messaging.",
    },
    create: {
      key: "WHATSAPP_META_CLOUD",
      name: "Meta WhatsApp Cloud API",
      category: "WHATSAPP",
      enabled: true,
      required: false,
      description: "Meta WhatsApp Cloud API for customer messaging.",
    },
  });

  await upsertCredential(provider.id, "WHATSAPP_PROVIDER", "WhatsApp Provider", "META_CLOUD", true);
  await upsertCredential(provider.id, "WHATSAPP_PHONE_NUMBER_ID", "WhatsApp Phone Number ID", "1246846671839814", true);
  await upsertCredential(provider.id, "WHATSAPP_BUSINESS_ACCOUNT_ID", "WhatsApp Business Account ID", "1675981006788563", true);
  await upsertCredential(provider.id, "WHATSAPP_ACCESS_TOKEN", "WhatsApp Access Token", "PASTE_WHATSAPP_ACCESS_TOKEN_HERE", true);
  await upsertCredential(provider.id, "WHATSAPP_VERIFY_TOKEN", "WhatsApp Verify Token", "AI-COMMERCEWA_secret_webhook_token_2026", true);
  await upsertCredential(provider.id, "WHATSAPP_TEMPLATE_NAMESPACE", "WhatsApp Template Namespace", "859525910562827", false);

  console.log("WhatsApp Meta Cloud credentials seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
