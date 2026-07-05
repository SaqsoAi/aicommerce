import prisma from "../../config/prisma";

export const createPurchaseOrderService = async (data: any) => {
  const orderNumber = `PO-${Date.now()}`;

  return prisma.purchaseOrder.create({
    data: {
      supplierId: data.supplierId,
      orderNumber,
      notes: data.notes,
      status: "PENDING",
      totalAmount: data.items.reduce(
        (sum: number, item: any) =>
          sum + Number(item.quantity) * Number(item.costPrice),
        0
      ),
      items: {
        create: data.items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          sku: item.sku ?? null,
          barcode: item.barcode ?? null,
          styleNo: item.styleNo ?? null,
          color: item.color ?? null,
          size: item.size ?? null,
          quantity: Number(item.quantity ?? 0),
          receivedQty: Number(item.receivedQty ?? 0),
          costPrice: Number(item.costPrice ?? 0),
          salesPrice: item.salesPrice ? Number(item.salesPrice) : null,
        })),
      },
    },
    include: {
      supplier: true,
      items: true,
      grns: {
        include: {
          items: true,
        },
      },
    },
  });
};

export const getPurchaseOrdersService = async () => {
  return prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      items: true,
      grns: {
        include: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const receivePurchaseOrderService = async (
  purchaseOrderId: string,
  data: any
) => {
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: {
      supplier: true,
      items: true,
    },
  });

  if (!purchaseOrder) {
    throw new Error("Purchase order not found");
  }

  const receiveItems = Array.isArray(data.items)
    ? data.items
    : purchaseOrder.items.map((item) => ({
        purchaseOrderItemId: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity - item.receivedQty,
        costPrice: item.costPrice,
        salesPrice: item.salesPrice,
      }));

  const validItems = receiveItems.filter(
    (item: any) => item.variantId && Number(item.quantity ?? 0) > 0
  );

  if (!validItems.length) {
    throw new Error("No valid variant items to receive");
  }

  const totalQty = validItems.reduce(
    (sum: number, item: any) => sum + Number(item.quantity ?? 0),
    0
  );

  const totalAmount = validItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantity ?? 0) * Number(item.costPrice ?? 0),
    0
  );

  return prisma.$transaction(async (tx) => {
    const grn = await tx.goodsReceiveNote.create({
      data: {
        purchaseOrderId,
        grnNumber: `GRN-${Date.now()}`,
        status: "COMPLETED",
        totalQty,
        totalAmount,
        notes: data.notes ?? null,
        items: {
          create: validItems.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: Number(item.quantity ?? 0),
            costPrice: Number(item.costPrice ?? 0),
            salePrice: item.salesPrice ? Number(item.salesPrice) : null,
          })),
        },
      },
      include: {
        items: true,
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
      },
    });

    for (const item of validItems) {
      const qty = Number(item.quantity ?? 0);

      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: true,
        },
      });

      if (!variant) continue;

      const previousStock = Number(
        variant.availableStock ?? variant.stock ?? 0
      );
      const newStock = previousStock + qty;

      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          stock: newStock,
          availableStock: newStock,
          costPrice: Number(item.costPrice ?? variant.costPrice ?? 0),
          salesPrice: item.salesPrice
            ? Number(item.salesPrice)
            : variant.salesPrice,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          variantId: variant.id,
          transactionType: "PURCHASE_RECEIVE",
          quantity: qty,
          previousStock,
          newStock,
          referenceId: grn.id,
          notes: `Received from ${purchaseOrder.supplier?.name ?? "Supplier"}`,
        },
      });

      if (item.purchaseOrderItemId) {
        const oldItem = await tx.purchaseOrderItem.findUnique({
          where: { id: item.purchaseOrderItemId },
        });

        if (oldItem) {
          await tx.purchaseOrderItem.update({
            where: { id: item.purchaseOrderItemId },
            data: {
              receivedQty: Number(oldItem.receivedQty ?? 0) + qty,
            },
          });
        }
      }
    }

    await tx.supplierLedger.create({
      data: {
        supplierId: purchaseOrder.supplierId,
        type: "PURCHASE",
        amount: totalAmount,
        referenceId: grn.id,
        notes: `GRN ${grn.grnNumber}`,
      },
    });

    await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        status: "RECEIVED",
      },
    });

    return grn;
  });
};

export const getGoodsReceiveNotesService = async () => {
  return prisma.goodsReceiveNote.findMany({
    include: {
      purchaseOrder: {
        include: {
          supplier: true,
        },
      },
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getSupplierLedgerService = async () => {
  return prisma.supplierLedger.findMany({
    include: {
      supplier: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// PHASE 5.3 ENTERPRISE PROCUREMENT GUARDS - START
const PHASE_5_3_PO_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
  "REJECTED",
] as const;

const PHASE_5_3_FINAL_PO_STATUSES = ["RECEIVED", "CANCELLED", "REJECTED"] as const;

function phase53AssertPositivePurchaseQuantity(quantity: unknown): void {
  const value = Number(quantity);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid purchase quantity: quantity must be greater than 0");
  }
}

function phase53AssertValidPurchaseCostPrice(costPrice: unknown): void {
  const value = Number(costPrice);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid purchase cost price");
  }
}

function phase53AssertPurchaseStatus(status: unknown): void {
  if (!PHASE_5_3_PO_STATUSES.includes(String(status) as any)) {
    throw new Error("Invalid purchase order status");
  }
}

function phase53AssertPurchaseStatusMutation(currentStatus: unknown, nextStatus: unknown): void {
  phase53AssertPurchaseStatus(nextStatus);
  const current = String(currentStatus);
  const next = String(nextStatus);

  if (PHASE_5_3_FINAL_PO_STATUSES.includes(current as any)) {
    throw new Error("Duplicate or invalid purchase status mutation");
  }

  const allowed: Record<string, string[]> = {
    DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
    PENDING_APPROVAL: ["APPROVED", "REJECTED", "CANCELLED"],
    APPROVED: ["PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"],
    PARTIALLY_RECEIVED: ["RECEIVED", "CANCELLED"],
  };

  if (!allowed[current]?.includes(next)) {
    throw new Error(`Invalid purchase status workflow: ${current} -> ${next}`);
  }
}

function phase53AssertPurchaseReceiveAllowed(status: unknown): void {
  const value = String(status);
  if (!["APPROVED", "PARTIALLY_RECEIVED"].includes(value)) {
    throw new Error("Invalid receive operation: purchase order must be approved or partially received");
  }
}
// PHASE 5.3 ENTERPRISE PROCUREMENT GUARDS - END
