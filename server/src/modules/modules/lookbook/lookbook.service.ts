import prisma from "../../config/prisma";

const includeLookbook = {
  items: {
    orderBy: {
      sortOrder: "asc" as const,
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  },
};

export const getLookbooks = async () => {
  return prisma.lookbook.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        take: 3,
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
};

export const getPublishedLookbooks = async () => {
  return prisma.lookbook.findMany({
    where: {
      published: true,
    },
    orderBy: [
      {
        featured: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      items: {
        take: 3,
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
};

export const getLookbookBySlug = async (slug: string) => {
  return prisma.lookbook.findUnique({
    where: {
      slug,
    },
    include: includeLookbook,
  });
};

export const getLookbookById = async (id: string) => {
  return prisma.lookbook.findUnique({
    where: {
      id,
    },
    include: includeLookbook,
  });
};

export const createLookbook = async (payload: any) => {
  const { items = [], ...lookbookData } = payload;

  return prisma.lookbook.create({
    data: {
      ...lookbookData,
      items: {
        create: items.map((item: any, index: number) => ({
          image: item.image,
          title: item.title,
          caption: item.caption,
          sortOrder: item.sortOrder ?? index,
          products: {
            create: (item.products ?? []).map((product: any) => ({
              productId: product.productId,
            })),
          },
        })),
      },
    },
    include: includeLookbook,
  });
};

export const updateLookbook = async (id: string, payload: any) => {
  const { items, ...lookbookData } = payload;

  return prisma.$transaction(async (tx) => {
    if (Array.isArray(items)) {
      await tx.lookbookItem.deleteMany({
        where: {
          lookbookId: id,
        },
      });
    }

    return tx.lookbook.update({
      where: {
        id,
      },
      data: {
        ...lookbookData,
        ...(Array.isArray(items)
          ? {
              items: {
                create: items.map((item: any, index: number) => ({
                  image: item.image,
                  title: item.title,
                  caption: item.caption,
                  sortOrder: item.sortOrder ?? index,
                  products: {
                    create: (item.products ?? []).map((product: any) => ({
                      productId: product.productId,
                    })),
                  },
                })),
              },
            }
          : {}),
      },
      include: includeLookbook,
    });
  });
};

export const deleteLookbook = async (id: string) => {
  return prisma.lookbook.delete({
    where: {
      id,
    },
  });
};

export const publishLookbook = async (id: string, published: boolean) => {
  return prisma.lookbook.update({
    where: {
      id,
    },
    data: {
      published,
    },
    include: includeLookbook,
  });
};
