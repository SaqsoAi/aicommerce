import prisma from "../../config/prisma";

export const getAnalytics = async () => {
  const totalRevenue = 0;
  const totalOrders = 0;
  const totalCustomers = 0;

  const heroViews = 0;
  const heroClicks = 0;

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    heroViews,
    heroClicks,
    ctr: heroViews > 0 ? (heroClicks / heroViews) * 100 : 0,
  };
};

export const getSalesForecast = async () => {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
    take: 30,
  });

  const total = orders.reduce((sum: number, order: { totalAmount?: number | null }) => sum + Number(order.totalAmount || 0),
    0
  );

  const average = orders.length > 0 ? total / orders.length : 0;

  return {
    todayForecast: Math.round(average),
    next7Days: Math.round(average * 7),
    next30Days: Math.round(average * 30),
    trend: orders.length > 0 ? "stable" : "no-data",
    confidence: orders.length > 10 ? 70 : 35,
    volatility: "low",
  };
};

export const getSavedLooksAnalytics = async () => {
  const totalSavedLooks = await prisma.savedLook.count();

  const groupedLookbooks = await prisma.savedLook.groupBy({
    by: ["lookbookId"],
    _count: {
      lookbookId: true,
    },
    orderBy: {
      _count: {
        lookbookId: "desc",
      },
    },
    take: 10,
  });

  const topSavedLookbooks = await Promise.all(
    groupedLookbooks.map(async (item) => {
      const lookbook = await prisma.lookbook.findUnique({
        where: {
          id: item.lookbookId,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          featured: true,
          published: true,
        },
      });

      return {
        lookbook,
        savedCount: item._count.lookbookId,
      };
    })
  );

  const recentSavedLooks = await prisma.savedLook.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    select: {
      id: true,
      createdAt: true,
      lookbook: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const totalUniqueLookbooks = groupedLookbooks.length;

  return {
    totalSavedLooks,
    totalUniqueLookbooks,
    topSavedLookbooks,
    recentSavedLooks,
  };
};

export const getVirtualTryOnAnalytics = async () => {
  const totalTryOns = await prisma.virtualTryOnJob.count();

  const completedTryOns = await prisma.virtualTryOnJob.count({
    where: {
      status: "COMPLETED",
    },
  });

  const failedTryOns = await prisma.virtualTryOnJob.count({
    where: {
      status: "FAILED",
    },
  });

  const processingTryOns = await prisma.virtualTryOnJob.count({
    where: {
      status: "PROCESSING",
    },
  });

  const groupedProducts = await prisma.virtualTryOnJob.groupBy({
    by: ["productId"],
    _count: {
      productId: true,
    },
    orderBy: {
      _count: {
        productId: "desc",
      },
    },
    take: 10,
  });

  const topTriedProducts = await Promise.all(
    groupedProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: {
          id: item.productId,
        },
        select: {
          id: true,
          name: true,
          thumbnail: true,
          price: true,
        },
      });

      return {
        product,
        tryOnCount: item._count.productId,
      };
    })
  );

  const recentTryOns = await prisma.virtualTryOnJob.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    select: {
      id: true,
      personImage: true,
      garmentImage: true,
      resultImage: true,
      provider: true,
      status: true,
      error: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          name: true,
          thumbnail: true,
          price: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    totalTryOns,
    completedTryOns,
    failedTryOns,
    processingTryOns,
    topTriedProducts,
    recentTryOns,
  };
};
