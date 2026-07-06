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