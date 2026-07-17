import prisma from "../config/prisma";

export const getCategoriesService =
  async (search?: string) => {
    return prisma.category.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},
      include: {
        subcategories: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  };

export const createCategoryService =
  async (
    name: string,
    slug: string,
    image?: string
  ) => {
    return prisma.category.create({
      data: {
        name,
        slug,
        image: image ?? null,
      },
    });
  };

export const updateCategoryService =
  async (
    id: string,
    name: string,
    slug: string,
    image?: string
  ) => {
    return prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        image: image ?? null,
      },
    });
  };

export const deleteCategoryService =
  async (id: string) => {
    return prisma.category.delete({
      where: { id },
    });
  };
const normalizeCategoryImageFields = <T extends any>(category: T): T => {
  if (!category || typeof category !== "object") return normalizeCategoryImageFields(category);

  const item: any = category;
  const image =
    item.image ||
    item.imageUrl ||
    item.thumbnail ||
    item.icon ||
    null;

  return {
    ...item,
    image,
    imageUrl: image,
    thumbnail: image,
  };
};

const normalizeCategoryListImageFields = <T extends any>(data: T): T => {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeCategoryImageFields(item)) as any;
  }

  return normalizeCategoryImageFields(data);
};