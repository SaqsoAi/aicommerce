import prisma from "../../config/prisma";

export const receiveInventoryService =
  async (
    variantId: string,
    quantity: number,
    referenceId?: string,
    notes?: string
  ) => {
    const variant =
      await prisma.productVariant.findUnique({
        where: {
          id: variantId,
        },
      });

    if (!variant) {
      throw new Error(
        "Variant not found"
      );
    }

    const previousStock =
      variant.stock;

    const newStock =
      previousStock + quantity;

    const availableStock =
      newStock -
      variant.reservedStock;

    await prisma.productVariant.update({
      where: {
        id: variantId,
      },

      data: {
        stock: newStock,

        availableStock,
      },
    });

    const transaction =
    await prisma.inventoryTransaction.create({
    data: {
      variantId,

      transactionType:
        "PURCHASE_RECEIVE",

      quantity,

      previousStock,

      newStock,

      referenceId:
        referenceId ?? null,

      notes:
        notes ?? null,
    },
  });

    return transaction;
  };
// PHASE 5.2 ENTERPRISE GRN RECEIVE HARDENING
export type EnterpriseReceiveLineInput = {
  productId?: string | null;
  variantId?: string | null;
  warehouseId?: string | null;
  orderedQuantity?: number | null;
  receivedQuantity: number;
  rejectedQuantity?: number | null;
};

export function assertEnterpriseReceiveLine(input: EnterpriseReceiveLineInput): EnterpriseReceiveLineInput {
  if (!input) throw new Error("Receive line is required");
  if (!input.variantId && !input.productId) throw new Error("Receive line requires productId or variantId");
  if (!input.warehouseId) throw new Error("Receive line requires warehouseId");

  const received = Number(input.receivedQuantity || 0);
  const rejected = Number(input.rejectedQuantity || 0);
  const ordered = input.orderedQuantity == null ? null : Number(input.orderedQuantity);

  if (!Number.isFinite(received) || received < 0) throw new Error("Received quantity cannot be negative");
  if (!Number.isFinite(rejected) || rejected < 0) throw new Error("Rejected quantity cannot be negative");
  if (ordered !== null && Number.isFinite(ordered) && received + rejected > ordered) {
    throw new Error("Received + rejected quantity cannot exceed ordered quantity");
  }

  return input;
}
// END PHASE 5.2 ENTERPRISE GRN RECEIVE HARDENING
