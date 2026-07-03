import prisma from "../../config/prisma";

export const getDashboardSummary =
  async () => {
    const totalProducts =
      await prisma.product.count();

    const totalCustomers =
      await prisma.user.count();

    const totalOrders =
      await prisma.order.count();

    const revenue =
      await prisma.order.aggregate({
        _sum: {
          finalAmount: true,
        },
      });

    const lowStock =
      await prisma.productVariant.count({
        where: {
          stock: {
            lte: 5,
          },
        },
      });

    const recentOrders =
      await prisma.order.findMany({
        take: 5,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          finalAmount: true,
          status: true,
          createdAt: true,
        },
      });

    return {
      totalProducts,
      totalCustomers,
      totalOrders,

      totalRevenue:
        revenue._sum.finalAmount || 0,

      lowStock,

      recentOrders,
    };
  };