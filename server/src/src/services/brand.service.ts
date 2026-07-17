import prisma from "../config/prisma";

export const getBrandsService = async (
  search?: string
) => {
  return prisma.brand.findMany({
    where: search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {},
    orderBy: {
      name: "asc",
    },
  });
};

export const getBrandByIdService =
  async (id: string) => {
    return prisma.brand.findUnique({
      where: { id },
    });
  };

export const createBrandService =
  async (
    name: string,
    logo: string | null = null
  ) => {
    const existing =
      await prisma.brand.findFirst({
        where: { name },
      });

    if (existing) {
      throw new Error(
        "Brand already exists"
      );
    }

    return prisma.brand.create({
      data: {
        name,
        logo: logo ?? null,
      },
    });
  };

export const updateBrandService =
  async (
    id: string,
    name: string,
    logo: string | null = null
  ) => {
    return prisma.brand.update({
      where: { id },

      data: {
        name,
        logo: logo ?? null,
      },
    });
  };

export const deleteBrandService =
  async (id: string) => {
    return prisma.brand.delete({
      where: { id },
    });
  };
