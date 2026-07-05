import prisma from "../../config/prisma";

type TransferStockPayload = {
  variantId: string;
  quantity: number;
  fromWarehouseLocation?: string;
  toWarehouseLocation: string;
  reason?: string;
};

export const transferVariantStock = async (
  payload: TransferStockPayload
) => {
  const {
    variantId,
    quantity,
    fromWarehouseLocation,
    toWarehouseLocation,
    reason,
  } = payload;

  if (!variantId) {
    throw new Error("Variant id is required");
  }

  if (!toWarehouseLocation) {
    throw new Error("Destination warehouse location is required");
  }

  if (quantity <= 0) {
    throw new Error("Transfer quantity must be greater than 0");
  }

  const variant = await prisma.productVariant.findUnique({
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

  const currentStock = Number(variant.stock || 0);
  const reservedStock = Number(variant.reservedStock || 0);

  if (quantity > currentStock) {
    throw new Error("Transfer quantity cannot exceed current stock");
  }

  const updated = await prisma.productVariant.update({
    where: {
      id: variantId,
    },
    data: {
      warehouseLocation: toWarehouseLocation,
      availableStock: Math.max(currentStock - reservedStock, 0),
    },
    include: {
      product: true,
    },
  });

  return {
    transfer: {
      variantId,
      productId: variant.productId,
      productName: variant.product?.name,
      sku: variant.sku,
      barcode: variant.barcode,
      quantity,
      fromWarehouseLocation:
        fromWarehouseLocation ||
        variant.warehouseLocation ||
        "Unassigned",
      toWarehouseLocation,
      reason: reason || "Manual stock transfer",
      transferredAt: new Date().toISOString(),
    },
    variant: updated,
  };
};

// PHASE 5.2 ENTERPRISE STOCK TRANSFER HARDENING
export type EnterpriseStockTransferInput = {
  productId?: string | null;
  variantId?: string | null;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reason?: string | null;
  actorId?: string | null;
};

export function assertEnterpriseStockTransfer(input: EnterpriseStockTransferInput): EnterpriseStockTransferInput {
  if (!input) throw new Error("Stock transfer payload is required");
  if (!input.variantId && !input.productId) throw new Error("Stock transfer requires productId or variantId");
  if (!input.fromWarehouseId) throw new Error("Stock transfer requires source warehouse");
  if (!input.toWarehouseId) throw new Error("Stock transfer requires target warehouse");
  if (input.fromWarehouseId === input.toWarehouseId) throw new Error("Source and target warehouse cannot be the same");
  if (!Number.isFinite(Number(input.quantity)) || Number(input.quantity) <= 0) throw new Error("Stock transfer quantity must be positive");
  return input;
}
// END PHASE 5.2 ENTERPRISE STOCK TRANSFER HARDENING
