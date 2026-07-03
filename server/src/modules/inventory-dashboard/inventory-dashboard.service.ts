import prisma from "../../config/prisma";
import { predictionAI } from "../../ai/prediction.ai";

export const getInventoryStatsService =
  async () => {
    const totalProducts =
      await prisma.product.count();

    const totalVariants =
      await prisma.productVariant.count();

    const stock =
      await prisma.productVariant.findMany({
        select: {
          stock: true,
        },
      });

    const totalStock =
      stock.reduce((sum: any, item: any) =>
          sum + item.stock,
        0
      );

    const lowStock =
      await prisma.productVariant.count({
        where: {
          stock: {
            lte: 5,
          },
        },
      });

    const outOfStock =
      await prisma.productVariant.count({
        where: {
          stock: {
            lte: 0,
          },
        },
      });

    return {
      totalProducts,
      totalVariants,
      totalStock,
      lowStock,
      outOfStock,
    };
  };

export const getInventoryAnalyticsService =
  async () => {
    const transactions =
      await prisma.inventoryTransaction.findMany();

    const received =
      transactions
        .filter((item: any) =>
            item.transactionType ===
            "RECEIVE"
        )
        .reduce((sum: any, item: any) =>
            sum + item.quantity,
          0
        );

    const returned =
      transactions
        .filter((item: any) =>
            item.transactionType ===
            "SUPPLIER_RETURN"
        )
        .reduce((sum: any, item: any) =>
            sum + item.quantity,
          0
        );

    const sold =
      transactions
        .filter((item: any) =>
            item.transactionType ===
            "SALE"
        )
        .reduce((sum: any, item: any) =>
            sum + item.quantity,
          0
        );

    return {
      received,
      returned,
      sold,
    };
  };

export const getInventoryHistoryService =
  async () => {
    return prisma.inventoryTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 50,
    });
  };

export const getLowStockService =
  async () => {
    return prisma.productVariant.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
    });
  };

export const getOutOfStockService =
  async () => {
    return prisma.productVariant.findMany({
      where: {
        stock: {
          lte: 0,
        },
      },
    });
  };

export const getSupplierReturnsWidgetService =
  async () => {
    return prisma.supplierReturn.findMany({
      include: {
        supplier: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 20,
    });
  };
export const getInventoryForecastService =
  async () => {
    const stats =
      await getInventoryStatsService();

    const analytics =
      await getInventoryAnalyticsService();

    const history =
      await prisma.inventoryTransaction.findMany({
        orderBy: {
          createdAt: "asc",
        },
        select: {
          quantity: true,
          transactionType: true,
        },
        take: 30,
      });

    const salesSeries =
      history
        .filter((item: any) =>
            item.transactionType === "SALE"
        )
        .map((item: any) =>
            Number(item.quantity || 0)
        );

    const prediction =
      predictionAI.predictAdvanced(salesSeries);

    const next7DayDemand =
      Number(prediction.nextWeek || 0);

    const next30DayDemand =
      Math.round(
        (next7DayDemand / 7) * 30
      );

    const lowStockRisk =
      stats.totalVariants > 0
        ? Math.round(
            (stats.lowStock / stats.totalVariants) * 100
          )
        : 0;

    const outOfStockRisk =
      stats.totalVariants > 0
        ? Math.round(
            (stats.outOfStock / stats.totalVariants) * 100
          )
        : 0;

    const reorderSuggestion =
      Math.max(
        next30DayDemand - stats.totalStock,
        0
      );

    return {
      totalStock: stats.totalStock,
      lowStockRisk,
      outOfStockRisk,
      sold: analytics.sold,
      next7DayDemand,
      next30DayDemand,
      reorderSuggestion,
      trend: prediction.trend,
      confidence: prediction.confidence,
      volatility: prediction.volatility,
    };
  };
