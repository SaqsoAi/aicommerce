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
// PHASE 5.3 SUPPLIER ENTERPRISE GUARDS - START
function phase53AssertSupplierActiveStatus(status: unknown): void {
  const value = String(status ?? "").toUpperCase();
  if (!["ACTIVE", "INACTIVE", "TRUE", "FALSE"].includes(value)) {
    throw new Error("Invalid supplier active status");
  }
}

function phase53AssertSupplierContactField(value: unknown, fieldName: string): void {
  if (value !== undefined && value !== null && String(value).length > 255) {
    throw new Error(`Invalid supplier ${fieldName}: max length exceeded`);
  }
}
// PHASE 5.3 SUPPLIER ENTERPRISE GUARDS - END
