import prisma from "../../config/prisma";

export const getCustomerIntelligenceProfile = async (userId: string) => {
  const [
    user,
    orders,
    savedLooks,
    tryOns,
    styleProfile,
    preferences,
    recommendations,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        provider: true,
        role: true,
        createdAt: true,
      },
    }),

    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        finalAmount: true,
        totalAmount: true,
        createdAt: true,
      },
    }),

    prisma.savedLook.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        lookbook: true,
      },
    }),

    prisma.virtualTryOnJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        product: true,
      },
    }),

    prisma.customerStyleProfile.findUnique({
      where: { userId },
    }),

    prisma.customerPreference.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),

    prisma.recommendationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalSpend = orders.reduce((sum: any, item: any) =>
      sum + Number(item.finalAmount || item.totalAmount || 0),
    0
  );

  const completedTryOns = tryOns.filter((item: any) => item.status === "COMPLETED"
  ).length;

  const intelligenceScore = Math.min(
    100,
    Math.round(
      orders.length * 8 +
        savedLooks.length * 6 +
        completedTryOns * 5 +
        preferences.length * 2
    )
  );

  return {
    user,
    summary: {
      totalOrders: orders.length,
      totalSpend,
      savedLooks: savedLooks.length,
      tryOns: tryOns.length,
      completedTryOns,
      preferences: preferences.length,
      recommendations: recommendations.length,
      intelligenceScore,
    },
    styleProfile,
    preferences,
    recentOrders: orders,
    recentSavedLooks: savedLooks,
    recentTryOns: tryOns,
    recommendations,
  };
};

export const getCustomerActivityTimeline = async (userId: string) => {
  const [activities, orders, savedLooks, tryOns] = await Promise.all([
    prisma.customerActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),

    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        finalAmount: true,
        totalAmount: true,
        createdAt: true,
      },
    }),

    prisma.savedLook.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        lookbook: true,
      },
    }),

    prisma.virtualTryOnJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        product: true,
      },
    }),
  ]);

  const orderEvents = orders.map((item: any) => ({
    id: `order-${item.id}`,
    type: "ORDER",
    title: `Order ${item.status}`,
    metadata: item,
    createdAt: item.createdAt,
  }));

  const savedLookEvents = savedLooks.map((item: any) => ({
    id: `saved-look-${item.id}`,
    type: "SAVED_LOOK",
    title: item.lookbook?.title || "Saved a look",
    metadata: item,
    createdAt: item.createdAt,
  }));

  const tryOnEvents = tryOns.map((item: any) => ({
    id: `tryon-${item.id}`,
    type: "VIRTUAL_TRYON",
    title: item.product?.name || "Virtual Try-On",
    metadata: item,
    createdAt: item.createdAt,
  }));

  return [
    ...activities,
    ...orderEvents,
    ...savedLookEvents,
    ...tryOnEvents,
  ]
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 50);
};

export const upsertCustomerPreference = async (
  userId: string,
  payload: {
    key: string;
    value: string;
    weight?: number;
    source?: string;
  }
) => {
  return prisma.customerPreference.upsert({
    where: {
      userId_key_value: {
        userId,
        key: payload.key,
        value: payload.value,
      },
    },
    update: {
      weight: payload.weight ?? 1,
      source: payload.source || "CUSTOMER",
    },
    create: {
      userId,
      key: payload.key,
      value: payload.value,
      weight: payload.weight ?? 1,
      source: payload.source || "CUSTOMER",
    },
  });
};

export const getCustomerPreferences = async (userId: string) => {
  return prisma.customerPreference.findMany({
    where: { userId },
    orderBy: [
      { weight: "desc" },
      { updatedAt: "desc" },
    ],
  });
};

export const refreshCustomerStyleProfile = async (userId: string) => {
  const [preferences, tryOns, savedLooks] = await Promise.all([
    prisma.customerPreference.findMany({
      where: { userId },
    }),

    prisma.virtualTryOnJob.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
      },
    }),

    prisma.savedLook.findMany({
      where: { userId },
      include: {
        lookbook: true,
      },
    }),
  ]);

  const categoryMap = new Map<string, number>();
  const brandMap = new Map<string, number>();

  tryOns.forEach((item: any) => {
    const category = item.product?.category?.name;
    const brand = item.product?.brand?.name;

    if (category) {
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }

    if (brand) {
      brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
    }
  });

  const topCategory =
    [...categoryMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
    null;

  const topBrand =
    [...brandMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
    null;

  const preferredStyle =
    preferences.find((item: any) => item.key === "style")?.value ||
    savedLooks[0]?.lookbook?.title ||
    null;

  const personalizationScore = Math.min(
    100,
    preferences.length * 8 + tryOns.length * 5 + savedLooks.length * 6
  );

  return prisma.customerStyleProfile.upsert({
    where: { userId },
    update: {
      topCategory,
      topBrand,
      preferredStyle,
      personalizationScore,
      metadata: {
        preferences: preferences.length,
        tryOns: tryOns.length,
        savedLooks: savedLooks.length,
      },
    },
    create: {
      userId,
      topCategory,
      topBrand,
      preferredStyle,
      personalizationScore,
      metadata: {
        preferences: preferences.length,
        tryOns: tryOns.length,
        savedLooks: savedLooks.length,
      },
    },
  });
};

export const getCustomerRecommendationHistory = async (userId: string) => {
  return prisma.recommendationHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};
