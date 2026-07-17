import prisma from "../../config/prisma";

export async function listTenantSubscriptions() {
  return prisma.tenantSubscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getTenantSubscription(tenantId: string) {
  const subscription = await prisma.tenantSubscription.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return subscription;
}

export async function startTenantTrial(payload: any) {
  if (!payload.tenantId || !payload.planKey) {
    throw new Error("tenantId and planKey are required");
  }

  const trialDays = Number(payload.trialDays || 14);
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  return prisma.tenantSubscription.create({
    data: {
      tenantId: String(payload.tenantId),
      planKey: String(payload.planKey),
      status: "TRIAL",
      billingCycle: payload.billingCycle ? String(payload.billingCycle) : "MONTHLY",
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt,
      trialEndsAt,
      meta: typeof payload.meta === "object" && payload.meta !== null ? payload.meta : {},
    },
  });
}

export async function activateTenantSubscription(payload: any) {
  if (!payload.tenantId || !payload.planKey) {
    throw new Error("tenantId and planKey are required");
  }

  const now = new Date();
  const billingCycle = payload.billingCycle ? String(payload.billingCycle) : "MONTHLY";
  const days = billingCycle === "YEARLY" ? 365 : 30;
  const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const existing = await prisma.tenantSubscription.findFirst({
    where: { tenantId: String(payload.tenantId) },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return prisma.tenantSubscription.update({
      where: { id: existing.id },
      data: {
        planKey: String(payload.planKey),
        status: "ACTIVE",
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
        suspendedAt: null,
        reason: null,
        meta: typeof payload.meta === "object" && payload.meta !== null ? payload.meta : existing.meta,
      },
    });
  }

  return prisma.tenantSubscription.create({
    data: {
      tenantId: String(payload.tenantId),
      planKey: String(payload.planKey),
      status: "ACTIVE",
      billingCycle,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      meta: typeof payload.meta === "object" && payload.meta !== null ? payload.meta : {},
    },
  });
}

export async function changeTenantPlan(payload: any) {
  if (!payload.tenantId || !payload.planKey) {
    throw new Error("tenantId and new planKey are required");
  }

  const existing = await prisma.tenantSubscription.findFirst({
    where: { tenantId: String(payload.tenantId) },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    return activateTenantSubscription(payload);
  }

  return prisma.tenantSubscription.update({
    where: { id: existing.id },
    data: {
      planKey: String(payload.planKey),
      reason: payload.reason ? String(payload.reason) : "PLAN_CHANGED",
      meta: typeof payload.meta === "object" && payload.meta !== null ? payload.meta : existing.meta,
    },
  });
}

export async function cancelTenantSubscription(payload: any) {
  if (!payload.tenantId) {
    throw new Error("tenantId is required");
  }

  const existing = await prisma.tenantSubscription.findFirst({
    where: { tenantId: String(payload.tenantId) },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    throw new Error("Subscription not found");
  }

  return prisma.tenantSubscription.update({
    where: { id: existing.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      reason: payload.reason ? String(payload.reason) : "CANCELLED_BY_ADMIN",
    },
  });
}

export async function suspendTenantSubscription(payload: any) {
  if (!payload.tenantId) {
    throw new Error("tenantId is required");
  }

  const existing = await prisma.tenantSubscription.findFirst({
    where: { tenantId: String(payload.tenantId) },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    throw new Error("Subscription not found");
  }

  return prisma.tenantSubscription.update({
    where: { id: existing.id },
    data: {
      status: "SUSPENDED",
      suspendedAt: new Date(),
      reason: payload.reason ? String(payload.reason) : "SUSPENDED_BY_ADMIN",
    },
  });
}

export async function getSubscriptionReadiness() {
  const [plans, subscriptions, usageRows, quotaRows] = await Promise.all([
    prisma.subscriptionPlan.count().catch(() => 0),
    prisma.tenantSubscription.count().catch(() => 0),
    prisma.subscriptionUsage.count().catch(() => 0),
    prisma.tenantQuota.count().catch(() => 0),
  ]);

  return {
    plans,
    subscriptions,
    usageRows,
    quotaRows,
    ready: plans > 0,
  };
}