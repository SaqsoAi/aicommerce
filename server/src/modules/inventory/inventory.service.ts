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
// PHASE 5.2 ENTERPRISE INVENTORY HARDENING
export type EnterpriseStockDirection = "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";

export type EnterpriseStockMovementInput = {
  productId?: string | null;
  variantId?: string | null;
  warehouseId?: string | null;
  branchId?: string | null;
  quantity: number;
  direction: EnterpriseStockDirection;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  actorId?: string | null;
};

export function assertEnterpriseStockMovement(input: EnterpriseStockMovementInput): EnterpriseStockMovementInput {
  if (!input) throw new Error("Stock movement payload is required");
  if (!input.variantId && !input.productId) throw new Error("Stock movement requires productId or variantId");
  if (!input.warehouseId) throw new Error("Stock movement requires warehouseId");
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) throw new Error("Stock movement quantity must be positive");
  if (!input.direction) throw new Error("Stock movement direction is required");
  if (!input.reason || input.reason.trim().length < 3) throw new Error("Stock movement reason is required");
  return input;
}

export function normalizeStockQuantity(quantity: unknown): number {
  const value = Number(quantity);
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function isLowStock(currentStock: unknown, threshold: unknown = 5): boolean {
  return normalizeStockQuantity(currentStock) <= normalizeStockQuantity(threshold);
}

export function canReserveStock(currentStock: unknown, requestedQty: unknown): boolean {
  const stock = normalizeStockQuantity(currentStock);
  const qty = normalizeStockQuantity(requestedQty);
  return qty > 0 && stock >= qty;
}
// END PHASE 5.2 ENTERPRISE INVENTORY HARDENING
