import express from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { protect } from "../modules/auth/auth.middleware";

const router = express.Router();
const prisma = new PrismaClient();

type MessageChannel = "SMS" | "WHATSAPP";

const normalizeBdPhone = (value: string) => {
  const raw = String(value || "").replace(/\D/g, "");
  if (!raw) return "";
  if (raw.startsWith("880")) return raw;
  if (raw.startsWith("0")) return `88${raw}`;
  return raw;
};

const encryptionSecret = () => {
  const value =
    process.env.ENCRYPTION_KEY ||
    process.env.CONTROL_CENTER_SECRET ||
    process.env.JWT_SECRET ||
    "ai-commerce-control-center-dev-secret-32";

  return crypto.createHash("sha256").update(value).digest();
};

const decryptMaybe = (value?: string | null) => {
  if (!value) return "";

  const parts = value.split(".");

  if (parts.length !== 3) {
    return value;
  }

  try {
    const iv = Buffer.from(parts[0], "base64");
    const tag = Buffer.from(parts[1], "base64");
    const encrypted = Buffer.from(parts[2], "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionSecret(), iv);

    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return value;
  }
};

const loadCredentialMap = async (providerKey: string) => {
  const provider = await prisma.integrationProvider.findUnique({
    where: { key: providerKey },
    include: { credentials: true },
  });

  if (!provider || !provider.enabled) {
    throw new Error(`${providerKey} provider is not enabled`);
  }

  const map = new Map<string, string>();

  for (const item of provider.credentials) {
    if (!item.isSet && !item.encryptedValue) continue;
    map.set(item.key, decryptMaybe(item.encryptedValue));
  }

  return map;
};

const sendSms = async (to: string, message: string) => {
  const map = await loadCredentialMap("SMS_GATEWAY");

  const apiKey = map.get("SMS_API_KEY") || process.env.SMS_API_KEY || "";
  const secretKey = map.get("SMS_SECRET_KEY") || process.env.SMS_SECRET_KEY || "";
  const callerId = map.get("SMS_CALLER_ID") || process.env.SMS_CALLER_ID || "ISRA";
  const endpoint =
    map.get("SMS_HTTP_ENDPOINT") ||
    process.env.SMS_HTTP_ENDPOINT ||
    "http://sms.songbirdtelecom.com:8746/sendtext";

  if (!apiKey || !secretKey) {
    throw new Error("SMS API key or secret key missing");
  }

  const body = {
    apikey: apiKey,
    secretkey: secretKey,
    callerID: callerId,
    toUser: normalizeBdPhone(to),
    messageContent: message,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();

  let parsed: any;

  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {
      Status: String(response.status),
      Text: text,
      Message_ID: "",
    };
  }

  return {
    ok: String(parsed.Status) === "0",
    provider: "SMS_GATEWAY",
    providerStatus: String(parsed.Status ?? ""),
    providerText: String(parsed.Text ?? ""),
    providerMessageId: String(parsed.Message_ID ?? ""),
    raw: parsed,
  };
};

const sendWhatsApp = async (to: string, message: string) => {
  const map = await loadCredentialMap("WHATSAPP_META_CLOUD");

  const phoneNumberId =
    map.get("WHATSAPP_PHONE_NUMBER_ID") ||
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    "";

  const accessToken =
    map.get("WHATSAPP_ACCESS_TOKEN") ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    "";

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp phone number ID or access token missing");
  }

  const endpoint = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizeBdPhone(to),
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    }),
  });

  const parsed: any = await response.json().catch(() => ({}));

  const messageId =
    parsed?.messages?.[0]?.id ||
    parsed?.error?.fbtrace_id ||
    "";

  return {
    ok: response.ok && Boolean(parsed?.messages?.[0]?.id),
    provider: "WHATSAPP_META_CLOUD",
    providerStatus: response.ok ? "SENT" : "FAILED",
    providerText: parsed?.error?.message || "WhatsApp request processed",
    providerMessageId: String(messageId),
    raw: parsed,
  };
};

const renderTemplate = (content: string, variables: Record<string, unknown>) => {
  let output = content;

  for (const [key, value] of Object.entries(variables || {})) {
    output = output.replace(
      new RegExp(`{{\\s*${key}\\s*}}`, "g"),
      String(value ?? ""),
    );
  }

  return output;
};

const resolveAudience = async (channel: MessageChannel, audience?: string, manualTargets?: string[]) => {
  if (Array.isArray(manualTargets) && manualTargets.length > 0) {
    return manualTargets.map(normalizeBdPhone).filter(Boolean);
  }

  const source = String(audience || "CUSTOM").toUpperCase();

  if (source !== "ALL_CUSTOMERS") {
    return [];
  }

  const users = await prisma.user.findMany({
    select: {
      phone: true,
      whatsapp: true,
    },
    take: 5000,
  });

  return users
    .map((user: any) => {
      if (channel === "WHATSAPP") {
        return user.whatsapp || user.phone || "";
      }

      return user.phone || user.whatsapp || "";
    })
    .map(normalizeBdPhone)
    .filter(Boolean);
};

const logMessage = async (args: {
  channel: MessageChannel;
  to: string;
  message: string;
  purpose: string;
  campaignId?: string;
  result: Awaited<ReturnType<typeof sendSms>>;
}) => {
  await prisma.messagingLog.create({
    data: {
      channel: args.channel,
      phone: args.channel === "SMS" ? normalizeBdPhone(args.to) : null,
      whatsapp: args.channel === "WHATSAPP" ? normalizeBdPhone(args.to) : null,
      message: args.message,
      purpose: args.purpose,
      campaignId: args.campaignId || null,
      provider: args.result.provider,
      providerStatus: args.result.providerStatus,
      providerText: args.result.providerText,
      providerMessageId: args.result.providerMessageId,
      deliveryStatus: args.result.ok ? "SENT" : "FAILED",
      rawResponse: args.result.raw,
    },
  });
};

const sendByChannel = async (channel: MessageChannel, to: string, message: string) => {
  if (channel === "SMS") return sendSms(to, message);
  if (channel === "WHATSAPP") return sendWhatsApp(to, message);

  throw new Error(`Unsupported channel: ${channel}`);
};

router.get("/health", async (_req, res) => {
  res.json({
    success: true,
    module: "enterprise-messaging",
    channels: ["SMS", "WHATSAPP"],
  });
});

router.get("/templates", protect, async (req, res) => {
  const channel = req.query.channel ? String(req.query.channel).toUpperCase() : undefined;

  const templates = await prisma.messagingTemplate.findMany({
    where: channel ? { channel } : undefined,
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: templates,
  });
});

router.post("/templates", protect, async (req, res) => {
  const key = String(req.body.key || "").trim().toUpperCase();
  const channel = String(req.body.channel || "SMS").trim().toUpperCase();
  const name = String(req.body.name || "").trim();
  const purpose = String(req.body.purpose || "GENERAL").trim().toUpperCase();
  const content = String(req.body.content || "").trim();

  if (!key || !name || !content) {
    return res.status(400).json({
      success: false,
      message: "key, name and content are required",
    });
  }

  const template = await prisma.messagingTemplate.upsert({
    where: { key },
    update: {
      channel,
      name,
      purpose,
      content,
      enabled: req.body.enabled === undefined ? true : Boolean(req.body.enabled),
      variables: req.body.variables || undefined,
    },
    create: {
      key,
      channel,
      name,
      purpose,
      content,
      enabled: req.body.enabled === undefined ? true : Boolean(req.body.enabled),
      variables: req.body.variables || undefined,
    },
  });

  res.json({
    success: true,
    data: template,
  });
});

router.get("/audiences", protect, async (_req, res) => {
  const audiences = await prisma.messagingAudience.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: audiences,
  });
});

router.post("/audiences", protect, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const sourceType = String(req.body.sourceType || "CUSTOM").trim().toUpperCase();

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "name is required",
    });
  }

  const audience = await prisma.messagingAudience.create({
    data: {
      name,
      description: req.body.description || null,
      sourceType,
      filterJson: req.body.filterJson || undefined,
      enabled: req.body.enabled === undefined ? true : Boolean(req.body.enabled),
    },
  });

  res.json({
    success: true,
    data: audience,
  });
});

router.post("/send", protect, async (req, res) => {
  try {
    const channel = String(req.body.channel || "SMS").toUpperCase() as MessageChannel;
    const to = String(req.body.to || req.body.phone || req.body.whatsapp || "").trim();
    const purpose = String(req.body.purpose || "MANUAL").toUpperCase();

    let message = String(req.body.message || "").trim();

    if (req.body.templateKey) {
      const template = await prisma.messagingTemplate.findUnique({
        where: { key: String(req.body.templateKey).toUpperCase() },
      });

      if (!template || !template.enabled) {
        return res.status(400).json({
          success: false,
          message: "Template not found or disabled",
        });
      }

      message = renderTemplate(template.content, req.body.variables || {});
    }

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: "to and message are required",
      });
    }

    const result = await sendByChannel(channel, to, message);

    await logMessage({
      channel,
      to,
      message,
      purpose,
      result,
    });

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.providerText || "Message failed",
        data: result,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Message send failed",
    });
  }
});

router.post("/campaigns", protect, async (req, res) => {
  try {
    const channel = String(req.body.channel || "SMS").toUpperCase() as MessageChannel;
    const audience = String(req.body.audience || "CUSTOM").toUpperCase();
    const name = String(req.body.name || "Messaging Campaign").trim();

    let message = String(req.body.message || "").trim();

    if (req.body.templateKey) {
      const template = await prisma.messagingTemplate.findUnique({
        where: { key: String(req.body.templateKey).toUpperCase() },
      });

      if (!template || !template.enabled) {
        return res.status(400).json({
          success: false,
          message: "Template not found or disabled",
        });
      }

      message = renderTemplate(template.content, req.body.variables || {});
    }

    const manualTargets =
      Array.isArray(req.body.targets)
        ? req.body.targets
        : Array.isArray(req.body.phones)
          ? req.body.phones
          : Array.isArray(req.body.whatsapps)
            ? req.body.whatsapps
            : [];

    const targets = await resolveAudience(channel, audience, manualTargets);

    if (targets.length === 0 || !message) {
      return res.status(400).json({
        success: false,
        message: "targets and message are required",
      });
    }

    const campaign = await prisma.messagingCampaign.create({
      data: {
        channel,
        name,
        message,
        audience,
        status: "PROCESSING",
        totalCount: targets.length,
      },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const target of targets) {
      try {
        const result = await sendByChannel(channel, target, message);

        await logMessage({
          channel,
          to: target,
          message,
          purpose: "CAMPAIGN",
          campaignId: campaign.id,
          result,
        });

        if (result.ok) sentCount++;
        else failedCount++;
      } catch (error: any) {
        failedCount++;

        await prisma.messagingLog.create({
          data: {
            channel,
            phone: channel === "SMS" ? normalizeBdPhone(target) : null,
            whatsapp: channel === "WHATSAPP" ? normalizeBdPhone(target) : null,
            message,
            purpose: "CAMPAIGN",
            campaignId: campaign.id,
            provider: channel,
            providerStatus: "FAILED",
            providerText: error.message || "Send failed",
            deliveryStatus: "FAILED",
            rawResponse: { error: error.message || "Send failed" },
          },
        });
      }
    }

    const updated = await prisma.messagingCampaign.update({
      where: { id: campaign.id },
      data: {
        sentCount,
        failedCount,
        status: failedCount === targets.length ? "FAILED" : "COMPLETED",
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Campaign failed",
    });
  }
});

router.get("/campaigns", protect, async (_req, res) => {
  const campaigns = await prisma.messagingCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json({
    success: true,
    data: campaigns,
  });
});

router.get("/logs", protect, async (req, res) => {
  const channel = req.query.channel ? String(req.query.channel).toUpperCase() : undefined;

  const logs = await prisma.messagingLog.findMany({
    where: channel ? { channel } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  res.json({
    success: true,
    data: logs,
  });
});

router.get("/analytics", protect, async (_req, res) => {
  const [total, smsTotal, whatsappTotal, sentTotal, failedTotal, campaigns] = await Promise.all([
    prisma.messagingLog.count(),
    prisma.messagingLog.count({ where: { channel: "SMS" } }),
    prisma.messagingLog.count({ where: { channel: "WHATSAPP" } }),
    prisma.messagingLog.count({ where: { deliveryStatus: "SENT" } }),
    prisma.messagingLog.count({ where: { deliveryStatus: "FAILED" } }),
    prisma.messagingCampaign.count(),
  ]);

  res.json({
    success: true,
    data: {
      total,
      smsTotal,
      whatsappTotal,
      sentTotal,
      failedTotal,
      campaigns,
      deliveryRate:
        total > 0
          ? Math.round((sentTotal / total) * 10000) / 100
          : 0,
    },
  });
});

router.get("/webhooks/whatsapp", async (req, res) => {
  const mode = String(req.query["hub.mode"] || "");
  const token = String(req.query["hub.verify_token"] || "");
  const challenge = String(req.query["hub.challenge"] || "");

  const map = await loadCredentialMap("WHATSAPP_META_CLOUD").catch(() => new Map<string, string>());
  const expected = map.get("WHATSAPP_VERIFY_TOKEN") || process.env.WHATSAPP_VERIFY_TOKEN || "";

  if (mode === "subscribe" && token === expected) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

router.post("/webhooks/whatsapp", async (req, res) => {
  await prisma.messagingLog.create({
    data: {
      channel: "WHATSAPP",
      message: "WEBHOOK",
      purpose: "WEBHOOK",
      provider: "WHATSAPP_META_CLOUD",
      rawResponse: req.body || {},
    },
  });

  res.sendStatus(200);
});

export default router;
