import express from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { protect } from "../modules/auth/auth.middleware";

const router = express.Router();
const prisma = new PrismaClient();

type Channel = "SMS" | "WHATSAPP";

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

  if (parts.length !== 3) return value;

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

const renderTemplate = (content: string, payload: Record<string, unknown>) => {
  let output = content;

  for (const [key, value] of Object.entries(payload || {})) {
    output = output.replace(
      new RegExp(`{{\\s*${key}\\s*}}`, "g"),
      String(value ?? ""),
    );
  }

  return output;
};

const resolveTemplateMessage = async (
  channel: Channel,
  templateKey?: string | null,
  payloadJson?: unknown,
  fallbackMessage?: string | null,
) => {
  if (fallbackMessage) return fallbackMessage;

  if (!templateKey) {
    return "";
  }

  const template = await prisma.messagingTemplate.findUnique({
    where: { key: templateKey },
  });

  if (!template || !template.enabled) {
    return "";
  }

  return renderTemplate(
    template.content,
    (payloadJson || {}) as Record<string, unknown>,
  );
};

const sendSms = async (receiver: string, message: string) => {
  const map = await loadCredentialMap("SMS_GATEWAY");

  const apiKey = map.get("SMS_API_KEY") || process.env.SMS_API_KEY || "";
  const secretKey = map.get("SMS_SECRET_KEY") || process.env.SMS_SECRET_KEY || "";
  const callerId = map.get("SMS_CALLER_ID") || process.env.SMS_CALLER_ID || "ISRA";
  const endpoint =
    map.get("SMS_HTTP_ENDPOINT") ||
    process.env.SMS_HTTP_ENDPOINT ||
    "http://sms.songbirdtelecom.com:8746/sendtext";

  if (!apiKey || !secretKey) {
    throw new Error("SMS credentials missing");
  }

  const body = {
    apikey: apiKey,
    secretkey: secretKey,
    callerID: callerId,
    toUser: normalizeBdPhone(receiver),
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

const sendWhatsApp = async (receiver: string, message: string) => {
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
    throw new Error("WhatsApp credentials missing");
  }

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizeBdPhone(receiver),
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    },
  );

  const parsed: any = await response.json().catch(() => ({}));
  const messageId = parsed?.messages?.[0]?.id || parsed?.error?.fbtrace_id || "";

  return {
    ok: response.ok && Boolean(parsed?.messages?.[0]?.id),
    provider: "WHATSAPP_META_CLOUD",
    providerStatus: response.ok ? "SENT" : "FAILED",
    providerText: parsed?.error?.message || "WhatsApp request processed",
    providerMessageId: String(messageId),
    raw: parsed,
  };
};

const sendByChannel = async (channel: Channel, receiver: string, message: string) => {
  if (channel === "SMS") return sendSms(receiver, message);
  if (channel === "WHATSAPP") return sendWhatsApp(receiver, message);
  throw new Error(`Unsupported channel ${channel}`);
};

const buildTemplateKey = (eventKey: string, channel: Channel) => {
  return `${channel}_${eventKey}`;
};

const enqueueBusinessEvent = async (args: {
  eventKey: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  channels?: Channel[];
  receiver?: string;
  payloadJson?: Record<string, unknown>;
  scheduledAt?: Date;
}) => {
  const channels = args.channels && args.channels.length > 0
    ? args.channels
    : ["SMS", "WHATSAPP"];

  const event = await prisma.messagingEvent.create({
    data: {
      eventKey: args.eventKey,
      entityType: args.entityType,
      entityId: args.entityId || null,
      userId: args.userId || null,
      channel: channels.join(","),
      status: "PENDING",
      payloadJson: (args.payloadJson || {}) as any,
    },
  });

  const receiver =
    args.receiver ||
    String(args.payloadJson?.phone || args.payloadJson?.whatsapp || "");

  if (!receiver) {
    await prisma.messagingEvent.update({
      where: { id: event.id },
      data: { status: "NO_RECEIVER" },
    });

    return {
      event,
      queues: [],
    };
  }

  const queues = [];

  for (const channel of channels) {
    const currentChannel = channel as Channel;
    const templateKey = buildTemplateKey(args.eventKey, currentChannel);

    const queue = await prisma.messagingQueue.create({
      data: {
        eventId: event.id,
        channel,
        receiver: normalizeBdPhone(receiver),
        templateKey,
        message: null,
        status: "PENDING",
        priority: 5,
        attempts: 0,
        maxAttempts: 3,
        scheduledAt: args.scheduledAt || new Date(),
        payloadJson: (args.payloadJson || {}) as any,
      },
    });

    queues.push(queue);
  }

  return {
    event,
    queues,
  };
};

const processQueueItem = async (queueId: string) => {
  const queue = await prisma.messagingQueue.findUnique({
    where: { id: queueId },
  });

  if (!queue) {
    throw new Error("Queue item not found");
  }

  if (!["PENDING", "RETRY", "FAILED"].includes(queue.status)) {
    return queue;
  }

  await prisma.messagingQueue.update({
    where: { id: queue.id },
    data: {
      status: "PROCESSING",
      attempts: { increment: 1 },
      processedAt: new Date(),
    },
  });

  const nextAttempt = queue.attempts + 1;

  try {
    const channel = queue.channel as Channel;
    const message = await resolveTemplateMessage(
      channel,
      queue.templateKey,
      queue.payloadJson,
      queue.message,
    );

    if (!message) {
      throw new Error(`Template/message missing for ${queue.templateKey}`);
    }

    const result = await sendByChannel(channel, queue.receiver, message);

    await prisma.messagingDeliveryAttempt.create({
      data: {
        queueId: queue.id,
        attemptNo: nextAttempt,
        status: result.ok ? "SENT" : "FAILED",
        provider: result.provider,
        providerStatus: result.providerStatus,
        providerText: result.providerText,
        providerMessageId: result.providerMessageId,
        rawResponse: result.raw,
      },
    });

    await prisma.messagingLog.create({
      data: {
        channel,
        phone: channel === "SMS" ? queue.receiver : null,
        whatsapp: channel === "WHATSAPP" ? queue.receiver : null,
        message,
        purpose: queue.templateKey || "QUEUE",
        campaignId: null,
        provider: result.provider,
        providerStatus: result.providerStatus,
        providerText: result.providerText,
        providerMessageId: result.providerMessageId,
        deliveryStatus: result.ok ? "SENT" : "FAILED",
        rawResponse: result.raw,
      },
    });

    if (result.ok) {
      await prisma.messagingQueue.update({
        where: { id: queue.id },
        data: {
          status: "SENT",
          lastError: null,
        },
      });

      return {
        ...queue,
        status: "SENT",
      };
    }

    throw new Error(result.providerText || "Delivery failed");
  } catch (error: any) {
    const shouldRetry = nextAttempt < queue.maxAttempts;
    const retryDelayMinutes = nextAttempt === 1 ? 5 : nextAttempt === 2 ? 30 : 120;

    await prisma.messagingDeliveryAttempt.create({
      data: {
        queueId: queue.id,
        attemptNo: nextAttempt,
        status: shouldRetry ? "RETRY" : "DEAD_LETTER",
        error: error.message || "Queue processing failed",
      },
    });

    await prisma.messagingQueue.update({
      where: { id: queue.id },
      data: {
        status: shouldRetry ? "RETRY" : "DEAD_LETTER",
        lastError: error.message || "Queue processing failed",
        scheduledAt: shouldRetry
          ? new Date(Date.now() + retryDelayMinutes * 60 * 1000)
          : null,
      },
    });

    return {
      ...queue,
      status: shouldRetry ? "RETRY" : "DEAD_LETTER",
    };
  }
};

const processDueQueue = async (limit = 25) => {
  const items = await prisma.messagingQueue.findMany({
    where: {
      status: {
        in: ["PENDING", "RETRY"],
      },
      OR: [
        { scheduledAt: null },
        { scheduledAt: { lte: new Date() } },
      ],
    },
    orderBy: [
      { priority: "asc" },
      { createdAt: "asc" },
    ],
    take: limit,
  });

  const results = [];

  for (const item of items) {
    results.push(await processQueueItem(item.id));
  }

  return results;
};

router.get("/health", protect, async (_req, res) => {
  res.json({
    success: true,
    module: "messaging-queue",
    statuses: ["PENDING", "PROCESSING", "SENT", "FAILED", "RETRY", "DEAD_LETTER"],
  });
});

router.post("/events", protect, async (req, res) => {
  const eventKey = String(req.body.eventKey || "").trim().toUpperCase();
  const entityType = String(req.body.entityType || "SYSTEM").trim().toUpperCase();

  if (!eventKey) {
    return res.status(400).json({
      success: false,
      message: "eventKey is required",
    });
  }

  const result = await enqueueBusinessEvent({
    eventKey,
    entityType,
    entityId: req.body.entityId || undefined,
    userId: req.body.userId || undefined,
    channels: Array.isArray(req.body.channels)
      ? req.body.channels.map((item: string) => String(item).toUpperCase() as Channel)
      : undefined,
    receiver: req.body.receiver || undefined,
    payloadJson: req.body.payloadJson || {},
    scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
  });

  res.json({
    success: true,
    data: result,
  });
});

router.post("/events/order", protect, async (req, res) => {
  const eventKey = String(req.body.eventKey || "ORDER_PLACED").toUpperCase();

  const result = await enqueueBusinessEvent({
    eventKey,
    entityType: "ORDER",
    entityId: req.body.orderId || req.body.entityId || undefined,
    userId: req.body.userId || undefined,
    receiver: req.body.phone || req.body.whatsapp || req.body.receiver,
    channels: (req.body.channels || ["SMS","WHATSAPP"]) as Channel[],
    payloadJson: {
      orderId: req.body.orderId,
      customerName: req.body.customerName,
      total: req.body.total,
      status: req.body.status,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
    },
  });

  res.json({
    success: true,
    data: result,
  });
});

router.post("/events/membership", protect, async (req, res) => {
  const eventKey = String(req.body.eventKey || "MEMBERSHIP_EARNED").toUpperCase();

  const result = await enqueueBusinessEvent({
    eventKey,
    entityType: "MEMBERSHIP",
    entityId: req.body.membershipId || req.body.entityId || undefined,
    userId: req.body.userId || undefined,
    receiver: req.body.phone || req.body.whatsapp || req.body.receiver,
    channels: (req.body.channels || ["SMS","WHATSAPP"]) as Channel[],
    payloadJson: {
      customerName: req.body.customerName,
      tier: req.body.tier,
      cardNo: req.body.cardNo,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
    },
  });

  res.json({
    success: true,
    data: result,
  });
});

router.post("/events/reward", protect, async (req, res) => {
  const eventKey = String(req.body.eventKey || "REWARD_EARNED").toUpperCase();

  const result = await enqueueBusinessEvent({
    eventKey,
    entityType: "REWARD",
    entityId: req.body.rewardId || req.body.entityId || undefined,
    userId: req.body.userId || undefined,
    receiver: req.body.phone || req.body.whatsapp || req.body.receiver,
    channels: (req.body.channels || ["SMS","WHATSAPP"]) as Channel[],
    payloadJson: {
      customerName: req.body.customerName,
      points: req.body.points,
      balance: req.body.balance,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
    },
  });

  res.json({
    success: true,
    data: result,
  });
});

router.get("/queue", protect, async (req, res) => {
  const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;

  const queue = await prisma.messagingQueue.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      event: true,
      attemptsLog: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  res.json({
    success: true,
    data: queue,
  });
});

router.post("/queue/:id/retry", protect, async (req, res) => {
  const queue = await prisma.messagingQueue.update({
    where: { id: String(req.params.id) },
    data: {
      status: "RETRY",
      scheduledAt: new Date(),
      lastError: null,
    },
  });

  res.json({
    success: true,
    data: queue,
  });
});

router.post("/queue/:id/process", protect, async (req, res) => {
  try {
    const result = await processQueueItem(String(req.params.id));

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Queue process failed",
    });
  }
});

router.post("/queue/process-due", protect, async (req, res) => {
  try {
    const limit = req.body.limit ? Number(req.body.limit) : 25;
    const result = await processDueQueue(limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Queue worker failed",
    });
  }
});

router.get("/events", protect, async (_req, res) => {
  const events = await prisma.messagingEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      queues: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  res.json({
    success: true,
    data: events,
  });
});

router.get("/analytics", protect, async (_req, res) => {
  const [
    pending,
    retry,
    sent,
    deadLetter,
    events,
  ] = await Promise.all([
    prisma.messagingQueue.count({ where: { status: "PENDING" } }),
    prisma.messagingQueue.count({ where: { status: "RETRY" } }),
    prisma.messagingQueue.count({ where: { status: "SENT" } }),
    prisma.messagingQueue.count({ where: { status: "DEAD_LETTER" } }),
    prisma.messagingEvent.count(),
  ]);

  res.json({
    success: true,
    data: {
      pending,
      retry,
      sent,
      deadLetter,
      events,
    },
  });
});

export default router;
