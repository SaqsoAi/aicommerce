import prisma from "../../config/prisma";

const defaultFlags = [
  { key: "ai_search", label: "AI Search", enabled: true },
  { key: "ai_chat", label: "AI Chat", enabled: false },
  { key: "ai_recommendation", label: "AI Recommendation", enabled: true },
  { key: "virtual_tryon", label: "Virtual Try-On", enabled: true },
  { key: "membership", label: "Membership", enabled: true },
  { key: "rewards", label: "Rewards", enabled: true },
  { key: "landing_builder", label: "Landing Builder", enabled: true },
  { key: "cms_builder", label: "CMS Builder", enabled: false },
];

const defaultPlans = [
  {
    key: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    limits: { products: 50, orders: 100, customers: 100, storageMb: 500, aiTokens: 1000, staff: 1 },
    features: { ai_search: false, ai_chat: false, virtual_tryon: false },
  },
  {
    key: "starter",
    name: "Starter",
    priceMonthly: 1500,
    priceYearly: 15000,
    limits: { products: 500, orders: 1000, customers: 1000, storageMb: 5000, aiTokens: 10000, staff: 3 },
    features: { ai_search: true, ai_chat: false, virtual_tryon: true },
  },
  {
    key: "growth",
    name: "Growth",
    priceMonthly: 5000,
    priceYearly: 50000,
    limits: { products: 5000, orders: 10000, customers: 10000, storageMb: 50000, aiTokens: 100000, staff: 10 },
    features: { ai_search: true, ai_chat: true, virtual_tryon: true },
  },
];

export async function seedSaasFoundation() {
  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      create: {
        key: flag.key,
        label: flag.label,
        enabled: flag.enabled,
        scope: "GLOBAL",
        config: {},
      },
      update: {},
    });
  }

  for (const plan of defaultPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { key: plan.key },
      create: {
        key: plan.key,
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        currency: "BDT",
        active: true,
        limits: plan.limits,
        features: plan.features,
      },
      update: {},
    });
  }

  return { flags: defaultFlags.length, plans: defaultPlans.length };
}

export async function listFeatureFlags() {
  await seedSaasFoundation();
  return prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
}

export async function updateFeatureFlag(payload: any) {
  if (!payload.key || !payload.label) throw new Error("key and label are required");

  return prisma.featureFlag.upsert({
    where: { key: String(payload.key) },
    create: {
      key: String(payload.key),
      label: String(payload.label),
      description: payload.description ? String(payload.description) : null,
      enabled: Boolean(payload.enabled),
      scope: payload.scope ? String(payload.scope) : "GLOBAL",
      config: typeof payload.config === "object" && payload.config !== null ? payload.config : {},
    },
    update: {
      label: String(payload.label),
      description: payload.description ? String(payload.description) : null,
      enabled: Boolean(payload.enabled),
      scope: payload.scope ? String(payload.scope) : "GLOBAL",
      config: typeof payload.config === "object" && payload.config !== null ? payload.config : {},
    },
  });
}

export async function listPlans() {
  await seedSaasFoundation();
  return prisma.subscriptionPlan.findMany({ orderBy: [{ sortOrder: "asc" }, { key: "asc" }] });
}

export async function updatePlan(payload: any) {
  if (!payload.key || !payload.name) throw new Error("key and name are required");

  return prisma.subscriptionPlan.upsert({
    where: { key: String(payload.key) },
    create: {
      key: String(payload.key),
      name: String(payload.name),
      description: payload.description ? String(payload.description) : null,
      priceMonthly: Number(payload.priceMonthly || 0),
      priceYearly: Number(payload.priceYearly || 0),
      currency: payload.currency ? String(payload.currency) : "BDT",
      active: typeof payload.active === "boolean" ? payload.active : true,
      sortOrder: Number(payload.sortOrder || 1),
      limits: typeof payload.limits === "object" && payload.limits !== null ? payload.limits : {},
      features: typeof payload.features === "object" && payload.features !== null ? payload.features : {},
    },
    update: {
      name: String(payload.name),
      description: payload.description ? String(payload.description) : null,
      priceMonthly: Number(payload.priceMonthly || 0),
      priceYearly: Number(payload.priceYearly || 0),
      currency: payload.currency ? String(payload.currency) : "BDT",
      active: typeof payload.active === "boolean" ? payload.active : true,
      sortOrder: Number(payload.sortOrder || 1),
      limits: typeof payload.limits === "object" && payload.limits !== null ? payload.limits : {},
      features: typeof payload.features === "object" && payload.features !== null ? payload.features : {},
    },
  });
}

export async function getTenantUsage(tenantId: string) {
  const id = tenantId || "default";

  const [products, orders, customers, aiUsage, quotas] = await Promise.all([
    prisma.product.count().catch(() => 0),
    prisma.order.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.aiUsageLog.aggregate({ _sum: { totalTokens: true, cost: true } }).catch(() => ({ _sum: { totalTokens: 0, cost: 0 } })),
    prisma.tenantQuota.findMany({ where: { tenantId: id }, orderBy: { key: "asc" } }).catch(() => []),
  ]);

  return {
    tenantId: id,
    usage: {
      products,
      orders,
      customers,
      aiTokens: Number(aiUsage._sum.totalTokens || 0),
      aiCost: Number(aiUsage._sum.cost || 0),
    },
    quotas,
  };
}

export async function updateTenantQuota(payload: any) {
  if (!payload.tenantId || !payload.key) throw new Error("tenantId and key are required");

  return prisma.tenantQuota.upsert({
    where: {
      tenantId_key: {
        tenantId: String(payload.tenantId),
        key: String(payload.key),
      },
    },
    create: {
      tenantId: String(payload.tenantId),
      planKey: payload.planKey ? String(payload.planKey) : null,
      key: String(payload.key),
      limit: Number(payload.limit || 0),
      enabled: typeof payload.enabled === "boolean" ? payload.enabled : true,
      meta: typeof payload.meta === "object" && payload.meta !== null ? payload.meta : {},
    },
    update: {
      planKey: payload.planKey ? String(payload.planKey) : null,
      limit: Number(payload.limit || 0),
      enabled: typeof payload.enabled === "boolean" ? payload.enabled : true,
      meta: typeof payload.meta === "object" && payload.meta !== null ? payload.meta : {},
    },
  });
}

export async function getPublicFeatureFlags() {
  await seedSaasFoundation();

  const flags = await prisma.featureFlag.findMany({
    where: { enabled: true },
    select: { key: true, label: true, description: true, enabled: true, scope: true, config: true },
    orderBy: { key: "asc" },
  });

  return { flags };
}