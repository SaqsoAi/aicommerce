import prisma from "../../config/prisma";

export const globalSearch = async (
  query: string
) => {
  const products =
    await prisma.product.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },

      take: 10,
    });

  const brands =
    await prisma.brand.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },

      take: 10,
    });

  const customers =
    await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },

      take: 10,
    });

  return {
    products,
    brands,
    customers,
  };
};