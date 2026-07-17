const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const secret =
  process.env.ENCRYPTION_KEY ||
  process.env.CONTROL_CENTER_SECRET ||
  process.env.JWT_SECRET ||
  "ai-commerce-control-center-dev-secret-32";

const encryptionKey = crypto
  .createHash("sha256")
  .update(secret)
  .digest();

function encryptValue(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
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

function maskValue(value) {
  if (!value) return "";
  if (value.length <= 4) return "****";
  return "****" + value.slice(-4);
}

async function upsertCredential(providerId, key, label, value, required = true) {
  const encryptedValue = value ? encryptValue(value) : null;
  const maskedValue = value ? maskValue(value) : null;
  const last4 = value ? value.slice(-4) : null;

  const credential = await prisma.integrationCredential.upsert({
    where: {
      providerId_key: {
        providerId,
        key,
      },
    },
    update: {
      label,
      encryptedValue,
      maskedValue,
      last4,
      isSet: Boolean(value),
      isEnabled: Boolean(value),
      isRequired: required,
      source: "CONTROL_CENTER",
    },
    create: {
      providerId,
      key,
      label,
      encryptedValue,
      maskedValue,
      last4,
      isSet: Boolean(value),
      isEnabled: Boolean(value),
      isRequired: required,
      source: "CONTROL_CENTER",
    },
  });

  await prisma.integrationCredentialHistory.create({
    data: {
      credentialId: credential.id,
      action: "SEED",
      maskedValue,
    },
  });
}

async function main() {
  const smsProvider = await prisma.integrationProvider.upsert({
    where: { key: "SMS_GATEWAY" },
    update: {
      name: "SMS Gateway",
      category: "SMS",
      enabled: true,
      required: false,
      description: "HTTP SMS Gateway for OTP verification and marketing campaign SMS.",
    },
    create: {
      key: "SMS_GATEWAY",
      name: "SMS Gateway",
      category: "SMS",
      enabled: true,
      required: false,
      description: "HTTP SMS Gateway for OTP verification and marketing campaign SMS.",
    },
  });

  await upsertCredential(smsProvider.id, "SMS_API_KEY", "SMS API Key", "PASTE_SMS_API_KEY_HERE", true);
  await upsertCredential(smsProvider.id, "SMS_SECRET_KEY", "SMS Secret Key", "PASTE_SMS_SECRET_KEY_HERE", true);
  await upsertCredential(smsProvider.id, "SMS_TPS", "SMS TPS Limit", "1000", false);
  await upsertCredential(smsProvider.id, "SMS_HTTP_ENDPOINT", "SMS HTTP Endpoint URL", "", false);

  await prisma.authProvider.upsert({
    where: { key: "PHONE_OTP" },
    update: {
      enabled: true,
      required: false,
      configJson: {
        type: "otp",
        phoneRequired: true,
        provider: "SMS_GATEWAY",
        tps: 1000,
      },
    },
    create: {
      key: "PHONE_OTP",
      name: "Phone OTP Login",
      enabled: true,
      required: false,
      configJson: {
        type: "otp",
        phoneRequired: true,
        provider: "SMS_GATEWAY",
        tps: 1000,
      },
    },
  });

  const permissions = [
    ["sms.gateway.manage", "Manage SMS Gateway"],
    ["sms.campaign.send", "Send SMS Campaign"],
    ["otp.settings.manage", "Manage OTP Settings"],
  ];

  for (const [code, name] of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: { name },
      create: {
        code,
        name,
        description: "SMS/OTP permission: " + name,
      },
    });
  }

  console.log("SMS Gateway provider, credentials placeholders, OTP provider, and permissions seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
