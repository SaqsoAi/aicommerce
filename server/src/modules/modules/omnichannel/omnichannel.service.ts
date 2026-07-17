import prisma from "../../config/prisma";

const db = prisma as any;

export const getOmnichannelHealth = async () => {
  const queue = await db.messagingQueue.groupBy({
    by: ["channel", "status"],
    _count: { id: true },
  });

  const providers = await db.integrationProvider.findMany({
    where: {
      category: { in: ["EMAIL", "PUSH", "SMS", "WHATSAPP"] },
    },
    include: { credentials: true },
  });

  return {
    queue,
    providers: providers.map((p: any) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      category: p.category,
      enabled: p.enabled,
      status: p.enabled ? "READY" : "DISABLED",
      configuredCredentials: p.credentials?.filter((c: any) => c.isSet).length || 0,
    })),
  };
};

export const getUnifiedTimeline = async (userId?: string) => {
  const [notifications, messages, events] = await Promise.all([
    db.notification.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.messagingLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.messagingEvent.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    notifications,
    messages,
    events,
  };
};

export const createOmnichannelRoute = async (payload: any) => {
  const channels: string[] = payload.channels || ["IN_APP"];
  const receiver = payload.receiver || payload.userId || "system";
  const message = payload.message || "Omnichannel message";
  const eventKey = payload.eventKey || "OMNICHANNEL_MANUAL";

  const event = await db.messagingEvent.create({
    data: {
      eventKey,
      entityType: payload.entityType || "OMNICHANNEL",
      entityId: payload.entityId,
      userId: payload.userId,
      channel: "OMNICHANNEL",
      status: "PENDING",
      payloadJson: payload,
    },
  });

  const queueItems = [];

  for (const channel of channels) {
    queueItems.push(
      await db.messagingQueue.create({
        data: {
          eventId: event.id,
          channel,
          receiver,
          templateKey: payload.templateKey,
          message,
          status: "PENDING",
          priority: payload.priority || 5,
          scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
          payloadJson: payload,
        },
      })
    );
  }

  if (channels.includes("IN_APP")) {
    await db.notification.create({
      data: {
        title: payload.title || "Notification",
        message,
        type: eventKey,
        userId: payload.userId,
      },
    });
  }

  return { event, queueItems };
};

export const getOmnichannelAnalytics = async () => {
  const queueByStatus = await db.messagingQueue.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const queueByChannel = await db.messagingQueue.groupBy({
    by: ["channel"],
    _count: { id: true },
  });

  const attemptsByStatus = await db.messagingDeliveryAttempt.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  return {
    queueByStatus,
    queueByChannel,
    attemptsByStatus,
  };
};
