import prisma from "../../config/prisma";

type CreateSupplierReturnInput = {
  supplierId: string;
  variantId: string;
  quantity: number;
  reason?: string;
};

export const createSupplierReturnService =
  async (
    data: CreateSupplierReturnInput
  ) => {
    const variant =
      await prisma.productVariant.findUnique({
        where: {
          id: data.variantId,
        },
      });

    if (!variant) {
      throw new Error(
        "Variant not found"
      );
    }

    if (
      variant.stock <
      data.quantity
    ) {
      throw new Error(
        "Insufficient stock"
      );
    }

    const previousStock =
      variant.stock;

    const newStock =
      previousStock -
      data.quantity;

    await prisma.productVariant.update({
      where: {
        id: data.variantId,
      },

      data: {
        stock: {
          decrement:
            data.quantity,
        },

        availableStock: {
          decrement:
            data.quantity,
        },
      },
    });

    const supplierReturn =
      await prisma.supplierReturn.create({
        data: {
          supplierId:
            data.supplierId,

          variantId:
            data.variantId,

          quantity:
            data.quantity,

          reason:
            data.reason ??
            null,
        },
      });

    await prisma.inventoryTransaction.create({
      data: {
        variantId:
          data.variantId,

        transactionType:
          "SUPPLIER_RETURN",

        quantity:
          data.quantity,

        previousStock,

        newStock,

        referenceId:
          supplierReturn.id,

        notes:
          data.reason ??
          "Supplier Return",
      },
    });

    return supplierReturn;
  };

export const getSupplierReturnsService =
  async () => {
    return prisma.supplierReturn.findMany({
      include: {
        supplier: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  };