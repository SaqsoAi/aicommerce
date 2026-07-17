import prisma from "../config/prisma";

export const predictSales =
  (
    previousSales: number
  ) => {
    return previousSales * 1.2;
  };

// âœ… REAL ADMIN ANALYTICS
export const dashboardStats =
  async () => {

    const totalSales =
      await prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      });

    return {
      totalSales,
    };
  };