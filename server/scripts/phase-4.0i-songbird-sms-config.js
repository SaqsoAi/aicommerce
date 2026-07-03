const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function upsertCredential(providerId, key, label, value, required = false) {
  await prisma.integrationCredential.upsert({
    where: { providerId_key: { providerId, key } },
    update: {
      label,
      encryptedValue: value,
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
      encryptedValue: value,
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
    where: { key: "SMS_GATEWAY" },
    update: {
      name: "Songbird Telecom SMS Gateway",
      category: "SMS",
      enabled: true,
      required: false,
      description: "Songbird HTTP SMS Gateway for OTP, order SMS, and marketing campaigns.",
    },
    create: {
      key: "SMS_GATEWAY",
      name: "Songbird Telecom SMS Gateway",
      category: "SMS",
      enabled: true,
      required: false,
      description: "Songbird HTTP SMS Gateway for OTP, order SMS, and marketing campaigns.",
    },
  });

  await upsertCredential(provider.id, "SMS_HTTP_ENDPOINT", "Send SMS Endpoint", "http://sms.songbirdtelecom.com:8746/sendtext", true);
  await upsertCredential(provider.id, "SMS_DLR_ENDPOINT", "DLR Endpoint", "http://sms.songbirdtelecom.com:8746/getstatus", false);
  await upsertCredential(provider.id, "SMS_CALLER_ID", "Caller ID / Sender ID", "ISRA", true);
  await upsertCredential(provider.id, "SMS_REQUEST_TYPE", "Request Type", "json", true);
  await upsertCredential(provider.id, "SMS_SEND_METHOD", "Send Method", "POST_JSON", true);
  await upsertCredential(provider.id, "SMS_DLR_METHOD", "DLR Method", "GET_QUERY", false);
  await upsertCredential(provider.id, "SMS_TPS", "TPS Limit", "1000", false);
  await upsertCredential(provider.id, "SMS_HASH_REQUIRED", "Hash Required", "false", false);
  await upsertCredential(provider.id, "SMS_TRAFFIC_TYPE", "Traffic Type", "MT", false);
  await upsertCredential(provider.id, "SMS_PROFILE_NAME", "Profile Name", "ISRA HTTP", false);

  await prisma.authProvider.upsert({
    where: { key: "PHONE_OTP" },
    update: {
      enabled: true,
      required: false,
      configJson: {
        type: "otp",
        phoneRequired: true,
        provider: "SMS_GATEWAY",
        callerId: "ISRA",
        sendEndpoint: "http://sms.songbirdtelecom.com:8746/sendtext",
        dlrEndpoint: "http://sms.songbirdtelecom.com:8746/getstatus",
        requestType: "json",
        sendMethod: "POST_JSON",
        tps: 1000
      }
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
        callerId: "ISRA",
        sendEndpoint: "http://sms.songbirdtelecom.com:8746/sendtext",
        dlrEndpoint: "http://sms.songbirdtelecom.com:8746/getstatus",
        requestType: "json",
        sendMethod: "POST_JSON",
        tps: 1000
      }
    }
  });

  console.log("Songbird SMS Gateway config updated.");
}

main().finally(async()=>prisma.$disconnect());
