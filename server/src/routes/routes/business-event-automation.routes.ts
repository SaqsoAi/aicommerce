import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../modules/auth/auth.middleware";

const router = express.Router();
const prisma = new PrismaClient();

type Channel = "SMS" | "WHATSAPP";

const normalizePhone = (value: string): string => {
  const raw = String(value || "").replace(/\D/g, "");
  if (!raw) return "";
  if (raw.startsWith("880")) return raw;
  if (raw.startsWith("0")) return `88${raw}`;
  return raw;
};

const buildTemplateKey = (channel: Channel, eventKey: string): string =>
  `${channel}_${eventKey}`;

const safeChannels = (value: unknown): Channel[] => {
  if (!Array.isArray(value)) return ["SMS", "WHATSAPP"];
  const channels = value
    .map((item) => String(item).toUpperCase())
    .filter((item): item is Channel => item === "SMS" || item === "WHATSAPP");
  return channels.length ? channels : ["SMS", "WHATSAPP"];
};

const createEventAndQueue = async (args: {
  eventKey: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  receiver?: string;
  channels?: Channel[];
  payloadJson?: Record<string, unknown>;
  scheduledAt?: Date;
}) => {
  const channels: Channel[] = args.channels?.length ? args.channels : ["SMS", "WHATSAPP"];
  const payload = args.payloadJson || {};
  const receiver = normalizePhone(
    args.receiver || String(payload.phone || payload.whatsapp || ""),
  );

  const event = await prisma.messagingEvent.create({
    data: {
      eventKey: args.eventKey,
      entityType: args.entityType,
      entityId: args.entityId || null,
      userId: args.userId || null,
      channel: channels.join(","),
      status: receiver ? "PENDING" : "NO_RECEIVER",
      payloadJson: payload as any,
    },
  });

  if (!receiver) return { event, queues: [] };

  const queues = [];

  for (const channel of channels) {
    const queue = await prisma.messagingQueue.create({
      data: {
        eventId: event.id,
        channel,
        receiver,
        templateKey: buildTemplateKey(channel, args.eventKey),
        status: "PENDING",
        priority: 5,
        attempts: 0,
        maxAttempts: 3,
        scheduledAt: args.scheduledAt || new Date(),
        payloadJson: payload as any,
      },
    });

    queues.push(queue);
  }

  return { event, queues };
};

router.get("/health", protect, async (_req, res) => {
  res.json({
    success: true,
    module: "business-event-automation",
    events: [
      "ORDER_PLACED",
      "ORDER_CONFIRMED",
      "ORDER_PACKED",
      "ORDER_SHIPPED",
      "ORDER_DELIVERED",
      "MEMBERSHIP_EARNED",
      "MEMBERSHIP_UPGRADED",
      "REWARD_EARNED",
      "REWARD_REDEEMED",
      "ABANDONED_CART_30M",
      "ABANDONED_CART_6H",
      "ABANDONED_CART_24H",
    ],
  });
});

router.post("/order", protect, async (req, res) => {
  const eventKey = String(req.body.eventKey || "ORDER_PLACED").toUpperCase();

  const result = await createEventAndQueue({
    eventKey,
    entityType: "ORDER",
    entityId: req.body.orderId || req.body.entityId || undefined,
    userId: req.body.userId || undefined,
    receiver: req.body.phone || req.body.whatsapp || req.body.receiver,
    channels: safeChannels(req.body.channels),
    payloadJson: {
      orderId: req.body.orderId,
      customerName: req.body.customerName,
      total: req.body.total,
      status: req.body.status,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
    },
  });

  res.json({ success: true, data: result });
});

router.post("/membership", protect, async (req, res) => {
  const eventKey = String(req.body.eventKey || "MEMBERSHIP_EARNED").toUpperCase();

  const result = await createEventAndQueue({
    eventKey,
    entityType: "MEMBERSHIP",
    entityId: req.body.membershipId || req.body.entityId || undefined,
    userId: req.body.userId || undefined,
    receiver: req.body.phone || req.body.whatsapp || req.body.receiver,
    channels: safeChannels(req.body.channels),
    payloadJson: {
      customerName: req.body.customerName,
      tier: req.body.tier,
      cardNo: req.body.cardNo,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
    },
  });

  res.json({ success: true, data: result });
});

router.post("/reward", protect, async (req, res) => {
  const eventKey = String(req.body.eventKey || "REWARD_EARNED").toUpperCase();

  const result = await createEventAndQueue({
    eventKey,
    entityType: "REWARD",
    entityId: req.body.rewardId || req.body.entityId || undefined,
    userId: req.body.userId || undefined,
    receiver: req.body.phone || req.body.whatsapp || req.body.receiver,
    channels: safeChannels(req.body.channels),
    payloadJson: {
      customerName: req.body.customerName,
      points: req.body.points,
      balance: req.body.balance,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
    },
  });

  res.json({ success: true, data: result });
});

router.post("/abandoned-cart", protect, async (req, res) => {
  const minutes = Number(req.body.minutes || 30);
  const eventKey =
    minutes >= 1440
      ? "ABANDONED_CART_24H"
      : minutes >= 360
        ? "ABANDONED_CART_6H"
        : "ABANDONED_CART_30M";

  const result = await createEventAndQueue({
    eventKey,
    entityType: "CART",
    entityId: req.body.cartId || req.body.entityId || undefined,
    userId: req.body.userId || undefined,
    receiver: req.body.phone || req.body.whatsapp || req.body.receiver,
    channels: safeChannels(req.body.channels),
    scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : new Date(),
    payloadJson: {
      customerName: req.body.customerName,
      cartId: req.body.cartId,
      cartTotal: req.body.cartTotal,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
    },
  });

  res.json({ success: true, data: result });
});

router.get("/rules", protect, async (_req, res) => {
  res.json({
    success: true,
    data: [
      "ORDER_PLACED",
      "ORDER_CONFIRMED",
      "ORDER_PACKED",
      "ORDER_SHIPPED",
      "ORDER_DELIVERED",
      "ORDER_CANCELLED",
      "MEMBERSHIP_EARNED",
      "MEMBERSHIP_UPGRADED",
      "REWARD_EARNED",
      "REWARD_REDEEMED",
      "ABANDONED_CART_30M",
      "ABANDONED_CART_6H",
      "ABANDONED_CART_24H",
    ],
  });
});

export default router;
