import prisma from "../../config/prisma";

type AdjustmentType =
  | "INCREASE"
  | "DECREASE"
  | "SET";

type AdjustStockPayload = {
  variantId: string;
  type: AdjustmentType;
  quantity: number;
  reason?: string;
  warehouseLocation?: string;
};

export const adjustVariantStock = async (
  payload: AdjustStockPayload
) => {
  const {
    variantId,
    type,
    quantity,
    reason,
    warehouseLocation,
  } = payload;

  if (!variantId) {
    throw new Error("Variant id is required");
  }

  if (!["INCREASE", "DECREASE", "SET"].includes(type)) {
    throw new Error("Invalid adjustment type");
  }

  if (quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }

  const variant =
    await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
      include: {
        product: true,
      },
    });

  if (!variant) {
    throw new Error("Variant not found");
  }

  const currentStock =
    Number(variant.stock || 0);

  let nextStock =
    currentStock;

  if (type === "INCREASE") {
    nextStock =
      currentStock + quantity;
  }

  if (type === "DECREASE") {
    nextStock =
      currentStock - quantity;
  }

  if (type === "SET") {
    nextStock =
      quantity;
  }

  if (nextStock < 0) {
    throw new Error("Stock cannot be negative");
  }

  const reservedStock =
    Number(variant.reservedStock || 0);

  const nextAvailableStock =
    Math.max(nextStock - reservedStock, 0);

  const updated =
    await prisma.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        stock: nextStock,
        availableStock: nextAvailableStock,
        warehouseLocation:
          warehouseLocation ??
          variant.warehouseLocation,
      },
      include: {
        product: true,
      },
    });

  return {
    adjustment: {
      variantId,
      productId: variant.productId,
      productName: variant.product?.name,
      sku: variant.sku,
      barcode: variant.barcode,
      type,
      previousStock: currentStock,
      quantity,
      nextStock,
      reason: reason || "Manual stock adjustment",
      warehouseLocation:
        warehouseLocation ??
        variant.warehouseLocation,
      adjustedAt: new Date().toISOString(),
    },
    variant: updated,
  };
};

// PHASE 5.2 ENTERPRISE STOCK ADJUSTMENT HARDENING
export type EnterpriseStockAdjustmentInput = {
  productId?: string | null;
  variantId?: string | null;
  warehouseId?: string | null;
  quantity: number;
  reason: string;
  actorId?: string | null;
};

export function assertEnterpriseStockAdjustment(input: EnterpriseStockAdjustmentInput): EnterpriseStockAdjustmentInput {
  if (!input) throw new Error("Stock adjustment payload is required");
  if (!input.variantId && !input.productId) throw new Error("Stock adjustment requires productId or variantId");
  if (!input.warehouseId) throw new Error("Stock adjustment requires warehouseId");
  if (!Number.isFinite(Number(input.quantity))) throw new Error("Stock adjustment quantity must be numeric");
  if (!input.reason || input.reason.trim().length < 3) throw new Error("Stock adjustment reason is required");
  return input;
}
// END PHASE 5.2 ENTERPRISE STOCK ADJUSTMENT HARDENING
