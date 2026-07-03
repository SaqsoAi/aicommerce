import prisma from "../../config/prisma";

export const createSupplierService =
  async (data: any) => {
    return prisma.supplier.create({
      data,
    });
  };

export const getSuppliersService =
  async () => {
    return prisma.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  };

export const updateSupplierService =
  async (
    id: string,
    data: any
  ) => {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  };

export const deleteSupplierService =
  async (id: string) => {
    return prisma.supplier.delete({
      where: { id },
    });
  };