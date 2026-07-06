import prisma from "../../config/prisma";

export const getInventoryService =
  async () => {
    return prisma.productVariant.findMany({
      include: {
        product: true,
      },

      orderBy: {
        createdAt: "desc",
      },
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

      include: {
        product: true,
      },
    });
  };

export const getOutOfStockService =
  async () => {
    return prisma.productVariant.findMany({
      where: {
        stock: 0,
      },

      include: {
        product: true,
      },
    });
  };

export const getInventoryHistoryService =
  async () => {
    return prisma.inventoryTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 100,
    });
  };