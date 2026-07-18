import prisma from "../../config/prisma";

const db = prisma as any;

type ProviderInput = {
  key: string;
  name: string;
  category: "EMAIL" | "PUSH";
  enabled?: boolean;
  description?: string;
  credentials?: Record<string, string>;
};

export const listNotificationProviders = async () => {
  return db.integrationProvider.findMany({
    where: {
      category: {
        in: ["EMAIL", "PUSH"],
      },
    },
    include: {
      credentials: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const upsertNotificationProvider = async (
  input: ProviderInput
) => {
  const provider = await db.integrationProvider.upsert({
    where: { key: input.key },
    update: {
      name: input.name,
      category: input.category,
      enabled: Boolean(input.enabled),
      description: input.description,
    },
    create: {
      key: input.key,
      name: input.name,
      category: input.category,
      enabled: Boolean(input.enabled),
      required: false,
      description: input.description,
    },
  });

  const credentials = input.credentials || {};

  for (const credentialKey of Object.keys(credentials)) {
    const value = credentials[credentialKey] || "";
    await db.integrationCredential.upsert({
      where: {
        providerId_key: {
          providerId: provider.id,
          key: credentialKey,
        },
      },
      update: {
        encryptedValue: value,
        maskedValue: value ? "********" : null,
        last4: value ? value.slice(-4) : null,
        isSet: Boolean(value),
        isEnabled: Boolean(value),
        source: "NOTIFICATION_PROVIDER_CENTER",
      },
      create: {
        providerId: provider.id,
        key: credentialKey,
        label: credentialKey,
        encryptedValue: value,
        maskedValue: value ? "********" : null,
        last4: value ? value.slice(-4) : null,
        isSet: Boolean(value),
        isEnabled: Boolean(value),
        isRequired: false,
        source: "NOTIFICATION_PROVIDER_CENTER",
      },
    });
  }

  return provider;
};

export const getNotificationProviderHealth = async () => {
  const providers = await listNotificationProviders();

  return providers.map((provider: any) => ({
    id: provider.id,
    key: provider.key,
    name: provider.name,
    category: provider.category,
    enabled: provider.enabled,
    configuredCredentials:
      provider.credentials?.filter((item: any) => item.isSet).length || 0,
    status: provider.enabled ? "READY" : "DISABLED",
  }));
};

export const queueTestEmail = async (
  to: string,
  message = "AI-COMMERCE test email notification"
) => {
  return db.messagingQueue.create({
    data: {
      channel: "EMAIL",
      receiver: to,
      templateKey: "TEST_EMAIL_PROVIDER",
      message,
      status: "PENDING",
      priority: 3,
      payloadJson: {
        source: "PHASE-4.0I-M",
        type: "TEST_EMAIL",
      },
    },
  });
};

export const queueTestPush = async (
  receiver: string,
  message = "AI-COMMERCE test push notification"
) => {
  return db.messagingQueue.create({
    data: {
      channel: "PUSH",
      receiver,
      templateKey: "TEST_PUSH_PROVIDER",
      message,
      status: "PENDING",
      priority: 3,
      payloadJson: {
        source: "PHASE-4.0I-M",
        type: "TEST_PUSH",
      },
    },
  });
};
