import express from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

import { protect } from "../modules/auth/auth.middleware";

const router = express.Router();
const prisma = new PrismaClient();

const getEncryptionSecret = () => {
  const secret =
    process.env.ENCRYPTION_KEY ||
    process.env.CONTROL_CENTER_SECRET ||
    process.env.JWT_SECRET;

  if (!secret || secret.length < 16) {
    return "ai-commerce-control-center-dev-secret-32";
  }

  return secret;
};

const getEncryptionKey = () => {
  return crypto
    .createHash("sha256")
    .update(getEncryptionSecret())
    .digest();
};

const encryptValue = (value: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);

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
};

const maskValue = (value: string) => {
  if (!value) return "";
  if (value.length <= 4) return "****";
  return `${"*".repeat(Math.max(value.length - 4, 4))}${value.slice(-4)}`;
};

const asBool = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  return fallback;
};

const getActorId = (req: express.Request) => {
  return String((req as any).user?.id || "");
};

router.get("/health", protect, async (_req, res) => {
  res.json({
    success: true,
    module: "control-center",
    features: [
      "ai-features",
      "auth-providers",
      "integrations",
      "store-settings",
    ],
  });
});

router.get("/auth-providers", protect, async (_req, res) => {
  const providers = await prisma.authProvider.findMany({
    orderBy: { key: "asc" },
    include: { settings: true },
  });

  res.json({
    success: true,
    data: providers,
  });
});

router.put("/auth-providers/:id", protect, async (req, res) => {
  const id = String(req.params.id);

  const updated = await prisma.authProvider.update({
    where: { id },
    data: {
      enabled: asBool(req.body.enabled, false),
      required: asBool(req.body.required, false),
      configJson: req.body.configJson ?? undefined,
    },
  });

  res.json({
    success: true,
    data: updated,
  });
});

router.get("/ai-features", protect, async (_req, res) => {
  const features = await prisma.aiFeature.findMany({
    orderBy: { key: "asc" },
  });

  res.json({
    success: true,
    data: features,
  });
});

router.post("/ai-features", protect, async (req, res) => {
  const key = String(req.body.key || "").trim().toUpperCase();
  const name = String(req.body.name || "").trim();

  if (!key || !name) {
    return res.status(400).json({
      success: false,
      message: "key and name are required",
    });
  }

  const feature = await prisma.aiFeature.upsert({
    where: { key },
    update: {
      name,
      enabled: asBool(req.body.enabled, false),
      providerKey: req.body.providerKey || null,
      model: req.body.model || null,
      dailyLimit: req.body.dailyLimit ? Number(req.body.dailyLimit) : null,
      monthlyLimit: req.body.monthlyLimit ? Number(req.body.monthlyLimit) : null,
      configJson: req.body.configJson ?? undefined,
    },
    create: {
      key,
      name,
      enabled: asBool(req.body.enabled, false),
      providerKey: req.body.providerKey || null,
      model: req.body.model || null,
      dailyLimit: req.body.dailyLimit ? Number(req.body.dailyLimit) : null,
      monthlyLimit: req.body.monthlyLimit ? Number(req.body.monthlyLimit) : null,
      configJson: req.body.configJson ?? undefined,
    },
  });

  res.json({
    success: true,
    data: feature,
  });
});

router.put("/ai-features/:id", protect, async (req, res) => {
  const id = String(req.params.id);

  const feature = await prisma.aiFeature.update({
    where: { id },
    data: {
      enabled: req.body.enabled === undefined ? undefined : Boolean(req.body.enabled),
      providerKey: req.body.providerKey ?? undefined,
      model: req.body.model ?? undefined,
      dailyLimit: req.body.dailyLimit === undefined ? undefined : Number(req.body.dailyLimit),
      monthlyLimit: req.body.monthlyLimit === undefined ? undefined : Number(req.body.monthlyLimit),
      configJson: req.body.configJson ?? undefined,
    },
  });

  res.json({
    success: true,
    data: feature,
  });
});

router.get("/integrations", protect, async (_req, res) => {
  const providers = await prisma.integrationProvider.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
    include: {
      credentials: {
        orderBy: { key: "asc" },
        select: {
          id: true,
          key: true,
          label: true,
          maskedValue: true,
          last4: true,
          isSet: true,
          isEnabled: true,
          isRequired: true,
          source: true,
          updatedAt: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: providers,
  });
});

router.post("/integrations", protect, async (req, res) => {
  const key = String(req.body.key || "").trim().toUpperCase();
  const name = String(req.body.name || "").trim();
  const category = String(req.body.category || "GENERAL").trim().toUpperCase();

  if (!key || !name) {
    return res.status(400).json({
      success: false,
      message: "key and name are required",
    });
  }

  const provider = await prisma.integrationProvider.upsert({
    where: { key },
    update: {
      name,
      category,
      enabled: asBool(req.body.enabled, false),
      required: asBool(req.body.required, false),
      description: req.body.description || null,
    },
    create: {
      key,
      name,
      category,
      enabled: asBool(req.body.enabled, false),
      required: asBool(req.body.required, false),
      description: req.body.description || null,
    },
  });

  res.json({
    success: true,
    data: provider,
  });
});

router.put("/integrations/:providerId/credentials/:credentialKey", protect, async (req, res) => {
  const providerId = String(req.params.providerId);
  const credentialKey = String(req.params.credentialKey || "").trim().toUpperCase();
  const value = String(req.body.value || "");

  if (!credentialKey) {
    return res.status(400).json({
      success: false,
      message: "credential key is required",
    });
  }

  const encryptedValue = value ? encryptValue(value) : null;
  const maskedValue = value ? maskValue(value) : null;
  const last4 = value ? value.slice(-4) : null;

  const credential = await prisma.integrationCredential.upsert({
    where: {
      providerId_key: {
        providerId,
        key: credentialKey,
      },
    },
    update: {
      label: req.body.label || credentialKey,
      encryptedValue,
      maskedValue,
      last4,
      isSet: Boolean(value),
      isEnabled: asBool(req.body.isEnabled, true),
      isRequired: asBool(req.body.isRequired, false),
      updatedBy: getActorId(req),
    },
    create: {
      providerId,
      key: credentialKey,
      label: req.body.label || credentialKey,
      encryptedValue,
      maskedValue,
      last4,
      isSet: Boolean(value),
      isEnabled: asBool(req.body.isEnabled, true),
      isRequired: asBool(req.body.isRequired, false),
      updatedBy: getActorId(req),
    },
  });

  await prisma.integrationCredentialHistory.create({
    data: {
      credentialId: credential.id,
      action: value ? "UPDATE" : "RESET",
      maskedValue,
      changedBy: getActorId(req),
    },
  });

  res.json({
    success: true,
    data: {
      id: credential.id,
      key: credential.key,
      label: credential.label,
      maskedValue: credential.maskedValue,
      last4: credential.last4,
      isSet: credential.isSet,
      isEnabled: credential.isEnabled,
      isRequired: credential.isRequired,
    },
  });
});

router.post("/integrations/:providerId/credentials/:credentialKey/reset", protect, async (req, res) => {
  const providerId = String(req.params.providerId);
  const credentialKey = String(req.params.credentialKey || "").trim().toUpperCase();

  const credential = await prisma.integrationCredential.update({
    where: {
      providerId_key: {
        providerId,
        key: credentialKey,
      },
    },
    data: {
      encryptedValue: null,
      maskedValue: null,
      last4: null,
      isSet: false,
      updatedBy: getActorId(req),
    },
  });

  await prisma.integrationCredentialHistory.create({
    data: {
      credentialId: credential.id,
      action: "RESET",
      maskedValue: null,
      changedBy: getActorId(req),
    },
  });

  res.json({
    success: true,
    data: {
      id: credential.id,
      key: credential.key,
      isSet: credential.isSet,
    },
  });
});

router.get("/store-settings/groups", protect, async (_req, res) => {
  const groups = await prisma.storeSettingGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      fields: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  res.json({
    success: true,
    data: groups,
  });
});

router.post("/store-settings/groups", protect, async (req, res) => {
  const key = String(req.body.key || "").trim().toUpperCase();
  const label = String(req.body.label || "").trim();

  if (!key || !label) {
    return res.status(400).json({
      success: false,
      message: "key and label are required",
    });
  }

  const group = await prisma.storeSettingGroup.upsert({
    where: { key },
    update: {
      label,
      sortOrder: req.body.sortOrder ? Number(req.body.sortOrder) : 0,
      enabled: asBool(req.body.enabled, true),
    },
    create: {
      key,
      label,
      sortOrder: req.body.sortOrder ? Number(req.body.sortOrder) : 0,
      enabled: asBool(req.body.enabled, true),
    },
  });

  res.json({
    success: true,
    data: group,
  });
});

router.post("/store-settings/fields", protect, async (req, res) => {
  const groupId = String(req.body.groupId || "");
  const key = String(req.body.key || "").trim().toUpperCase();
  const label = String(req.body.label || "").trim();
  const type = String(req.body.type || "text").trim();

  if (!groupId || !key || !label) {
    return res.status(400).json({
      success: false,
      message: "groupId, key and label are required",
    });
  }

  const field = await prisma.storeSettingField.upsert({
    where: {
      groupId_key: {
        groupId,
        key,
      },
    },
    update: {
      label,
      type,
      required: asBool(req.body.required, false),
      enabled: asBool(req.body.enabled, true),
      sortOrder: req.body.sortOrder ? Number(req.body.sortOrder) : 0,
      optionsJson: req.body.optionsJson ?? undefined,
    },
    create: {
      groupId,
      key,
      label,
      type,
      required: asBool(req.body.required, false),
      enabled: asBool(req.body.enabled, true),
      sortOrder: req.body.sortOrder ? Number(req.body.sortOrder) : 0,
      optionsJson: req.body.optionsJson ?? undefined,
    },
  });

  res.json({
    success: true,
    data: field,
  });
});

router.put("/store-settings/fields/:id", protect, async (req, res) => {
  const id = String(req.params.id);

  const field = await prisma.storeSettingField.update({
    where: { id },
    data: {
      label: req.body.label ?? undefined,
      type: req.body.type ?? undefined,
      required: req.body.required === undefined ? undefined : Boolean(req.body.required),
      enabled: req.body.enabled === undefined ? undefined : Boolean(req.body.enabled),
      sortOrder: req.body.sortOrder === undefined ? undefined : Number(req.body.sortOrder),
      optionsJson: req.body.optionsJson ?? undefined,
    },
  });

  res.json({
    success: true,
    data: field,
  });
});

router.delete("/store-settings/fields/:id", protect, async (req, res) => {
  const id = String(req.params.id);

  await prisma.storeSettingField.delete({
    where: { id },
  });

  res.json({
    success: true,
  });
});

export default router;
