import { Request, Response } from "express";
import prisma from "../config/prisma";

type InventoryVariant = {
  availableStock?: number | null;
  stock?: number | null;
  costPrice?: number | null;
  salesPrice?: number | null;
  price?: number | null;
  lowStockThreshold?: number | null;
  product?: {
    price?: number | null;
  } | null;
};

const getVariants = async () => {
  return prisma.productVariant.findMany({
    include: {
      product: {
        include: {
          category: true,
          subcategory: true,
          brand: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getStock = (item: InventoryVariant) =>
  Number(item.availableStock ?? item.stock ?? 0);

export const getInventory = async (_req: Request, res: Response) => {
  try {
    const data = await getVariants();

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInventoryStats = async (_req: Request, res: Response) => {
  try {
    const variants = await getVariants();

    const totalQty = variants.reduce(
      (sum: number, item: InventoryVariant) => sum + getStock(item),
      0
    );

    const totalCostValue = variants.reduce(
      (sum: number, item: InventoryVariant) =>
        sum + Number(item.costPrice ?? 0) * getStock(item),
      0
    );

    const totalSaleValue = variants.reduce(
      (sum: number, item: InventoryVariant) =>
        sum +
        Number(item.salesPrice ?? item.price ?? item.product?.price ?? 0) *
          getStock(item),
      0
    );

    const lowStock = variants.filter(
      (item: InventoryVariant) =>
        getStock(item) > 0 &&
        getStock(item) <= Number(item.lowStockThreshold ?? 5)
    );

    const outOfStock = variants.filter(
      (item: InventoryVariant) => getStock(item) <= 0
    );

    return res.json({
      success: true,
      data: {
        totalVariants: variants.length,
        totalQty,
        totalCostValue,
        totalSaleValue,
        potentialProfit: totalSaleValue - totalCostValue,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLowStock = async (_req: Request, res: Response) => {
  try {
    const variants = await getVariants();

    const data = variants.filter(
      (item: InventoryVariant) =>
        getStock(item) > 0 &&
        getStock(item) <= Number(item.lowStockThreshold ?? 5)
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOutOfStock = async (_req: Request, res: Response) => {
  try {
    const variants = await getVariants();

    const data = variants.filter(
      (item: InventoryVariant) => getStock(item) <= 0
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getInventoryHistory = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.inventoryTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReconciliation = async (_req: Request, res: Response) => {
  try {
    const variants = await getVariants();

    const data = variants.map((item: any) => {
      const stock = Number(item.availableStock ?? item.stock ?? 0);

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product?.name ?? item.product?.title ?? null,
        sku: item.sku ?? null,
        stock,
        status: stock <= 0 ? "OUT_OF_STOCK" : stock <= Number(item.lowStockThreshold ?? 5) ? "LOW_STOCK" : "OK",
      };
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
