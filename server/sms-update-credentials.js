const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function upsertCredential(providerId, key, label, value, required = true) {
  const existing = await prisma.integrationCredential.findFirst({
    where: { providerId, key }
  });

  if (existing) {
    await prisma.integrationCredential.update({
      where: { id: existing.id },
      data: {
        encryptedValue: value,
        maskedValue: "SET",
        last4: value.slice(-4),
        isSet: true,
        isEnabled: true,
        isRequired: required,
        source: "CONTROL_CENTER"
      }
    });
  } else {
    await prisma.integrationCredential.create({
      data: {
        providerId,
        key,
        label,
        encryptedValue: value,
        maskedValue: "SET",
        last4: value.slice(-4),
        isSet: true,
        isEnabled: true,
        isRequired: required,
        source: "CONTROL_CENTER"
      }
    });
  }
}

async function run() {
  const provider = await prisma.integrationProvider.upsert({
    where: { key: "SMS_GATEWAY" },
    update: { enabled: true },
    create: {
      key: "SMS_GATEWAY",
      name: "Songbird Telecom SMS Gateway",
      category: "SMS",
      enabled: true,
      required: false,
      description: "Songbird HTTP SMS Gateway"
    }
  });

  await upsertCredential(provider.id, "SMS_API_KEY", "SMS API Key", "d03406f767bb3696");
  await upsertCredential(provider.id, "SMS_SECRET_KEY", "SMS Secret Key", "2e5da6ac");
  await upsertCredential(provider.id, "SMS_CALLER_ID", "Caller ID / Sender ID", "ISRA");
  await upsertCredential(provider.id, "SMS_HTTP_ENDPOINT", "Send SMS Endpoint", "http://sms.songbirdtelecom.com:8746/sendtext");
  await upsertCredential(provider.id, "SMS_DLR_ENDPOINT", "DLR Endpoint", "http://sms.songbirdtelecom.com:8746/getstatus", false);
  await upsertCredential(provider.id, "SMS_SEND_METHOD", "Send Method", "GET_QUERY", false);

  console.log("SMS Gateway credentials updated");
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
