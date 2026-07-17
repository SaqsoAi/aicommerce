import { Request, Response } from "express";
import prisma from "../config/prisma";

// Ã°Å¸â€œÅ  ADMIN DASHBOARD STATS
export const getDashboardStats = async (
  req: Request,
  res: Response
) => {
  try {
    // =========================
    // Ã°Å¸â€™Â° REVENUE (TOTAL SALES)
    // =========================
    const totalSales = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    // =========================
    // Ã°Å¸â€œÂ¦ TOTAL ORDERS
    // =========================
    const totalOrders = await prisma.order.count();

    // =========================
    // Ã°Å¸â€˜Â¤ TOTAL CUSTOMERS
    // =========================
    const totalCustomers = await prisma.user.count();

    // =========================
    // Ã°Å¸â€Â¥ TOP PRODUCTS
    // =========================
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: "desc",
        },
      },
      take: 5,
    });

    // =========================
    // Ã¢Å¡Â  LOW STOCK PRODUCTS
    // =========================
    const lowStock = await prisma.productVariant.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
    });

    // =========================
    // Ã¢Å“â€¦ RESPONSE
    // =========================
    return res.json({
      revenue: totalSales._sum.totalAmount || 0,
      orders: totalOrders,
      customers: totalCustomers,
      topProducts,
      lowStock,
    });
  } catch (error: any) {
    console.log("Analytics Error:", error);

    return res.status(500).json({
      message: "Failed to load dashboard stats",
      error: error.message,
    });
  }
};