import prisma from "../../config/prisma";

const defaultFeatures = [
  {
    key: "smart_search",
    label: "AI Smart Search",
    description: "AI-powered search improvement for product discovery.",
    enabled: true,
    placement: ["client_header", "shop_page"],
  },
  {
    key: "product_recommendation",
    label: "AI Product Recommendation",
    description: "Personalized product recommendations for homepage, PDP, and cart.",
    enabled: true,
    placement: ["homepage", "product_page", "cart_page"],
  },
  {
    key: "ai_stylist",
    label: "AI Stylist Chat",
    description: "Shopping assistant and style advisor.",
    enabled: false,
    placement: ["product_page", "size_fit_center"],
  },
  {
    key: "predictive_cart",
    label: "Predictive Cart Optimization",
    description: "Cart upsell and next-best-action suggestions.",
    enabled: false,
    placement: ["cart_page", "checkout_page"],
  },
  {
    key: "virtual_tryon",
    label: "Virtual Try-On",
    description: "Camera and image based garment try-on experience.",
    enabled: true,
    placement: ["product_page", "virtual_tryon_page"],
  },
];

const defaultProviders = [
  {
    key: "openai",
    name: "OpenAI",
    model: "gpt-4.1-mini",
    apiKeyEnv: "OPENAI_API_KEY",
    enabled: false,
    priority: 1,
  },
  {
    key: "fal",
    name: "fal.ai",
    model: "fashn-tryon",
    apiKeyEnv: "FAL_KEY",
    enabled: true,
    priority: 2,
  },
  {
    key: "local_rules",
    name: "Local Rule Engine",
    model: "server-rules-v1",
    apiKeyEnv: null,
    enabled: true,
    priority: 99,
  },
];

export async function seedAiControlDefaults() {
  for (const feature of defaultFeatures) {
    await prisma.aiFeatureSetting.upsert({
      where: { key: feature.key },
      create: {
        key: feature.key,
        label: feature.label,
        description: feature.description,
        enabled: feature.enabled,
        placement: feature.placement,
        config: {},
      },
      update: {},
    });
  }

  for (const provider of defaultProviders) {
    await prisma.aiProvider.upsert({
      where: { key: provider.key },
      create: {
        key: provider.key,
        name: provider.name,
        model: provider.model,
        apiKeyEnv: provider.apiKeyEnv,
        enabled: provider.enabled,
        priority: provider.priority,
        config: {},
      },
      update: {},
    });
  }

  return {
    features: defaultFeatures.length,
    providers: defaultProviders.length,
  };
}

export async function getAiControlDashboard() {
  await seedAiControlDefaults();

  const [features, providers, recentUsage, overrides] = await Promise.all([
    prisma.aiFeatureSetting.findMany({ orderBy: { key: "asc" } }),
    prisma.aiProvider.findMany({ orderBy: [{ priority: "asc" }, { key: "asc" }] }),
    prisma.aiUsageLog.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
    prisma.aiOverride.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
  ]);

  const usageSummary = await prisma.aiUsageLog.groupBy({
    by: ["featureKey"],
    _sum: {
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
      cost: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    features,
    providers,
    recentUsage,
    overrides,
    usageSummary,
  };
}

export async function updateAiFeature(key: string, payload: any) {
  if (!key) throw new Error("Feature key is required");

  return prisma.aiFeatureSetting.update({
    where: { key },
    data: {
      label: typeof payload.label === "string" ? payload.label : undefined,
      description: typeof payload.description === "string" ? payload.description : undefined,
      enabled: typeof payload.enabled === "boolean" ? payload.enabled : undefined,
      placement: Array.isArray(payload.placement) ? payload.placement : undefined,
      config: typeof payload.config === "object" && payload.config !== null ? payload.config : undefined,
    },
  });
}

export async function updateAiProvider(key: string, payload: any) {
  if (!key) throw new Error("Provider key is required");

  return prisma.aiProvider.update({
    where: { key },
    data: {
      name: typeof payload.name === "string" ? payload.name : undefined,
      model: typeof payload.model === "string" ? payload.model : undefined,
      apiKeyEnv: typeof payload.apiKeyEnv === "string" ? payload.apiKeyEnv : undefined,
      enabled: typeof payload.enabled === "boolean" ? payload.enabled : undefined,
      priority: Number.isInteger(payload.priority) ? payload.priority : undefined,
      config: typeof payload.config === "object" && payload.config !== null ? payload.config : undefined,
    },
  });
}

export async function logAiUsage(payload: any) {
  return prisma.aiUsageLog.create({
    data: {
      featureKey: String(payload.featureKey || "unknown"),
      providerKey: payload.providerKey ? String(payload.providerKey) : null,
      model: payload.model ? String(payload.model) : null,
      promptTokens: Number(payload.promptTokens || 0),
      completionTokens: Number(payload.completionTokens || 0),
      totalTokens: Number(payload.totalTokens || 0),
      cost: Number(payload.cost || 0),
      status: String(payload.status || "SUCCESS"),
      source: payload.source ? String(payload.source) : null,
      userId: payload.userId ? String(payload.userId) : null,
      meta: typeof payload.meta === "object" && payload.meta !== null ? payload.meta : {},
    },
  });
}

export async function createAiOverride(payload: any) {
  if (!payload.featureKey || !payload.targetType || !payload.targetId) {
    throw new Error("featureKey, targetType and targetId are required");
  }

  return prisma.aiOverride.create({
    data: {
      featureKey: String(payload.featureKey),
      targetType: String(payload.targetType),
      targetId: String(payload.targetId),
      value: typeof payload.value === "object" && payload.value !== null ? payload.value : {},
      reason: payload.reason ? String(payload.reason) : null,
      active: typeof payload.active === "boolean" ? payload.active : true,
      createdBy: payload.createdBy ? String(payload.createdBy) : null,
    },
  });
}

export async function getPublicAiAvailability() {
  await seedAiControlDefaults();

  const features = await prisma.aiFeatureSetting.findMany({
    where: { enabled: true },
    select: {
      key: true,
      label: true,
      description: true,
      enabled: true,
      placement: true,
      config: true,
    },
    orderBy: { key: "asc" },
  });

  return { features };
}