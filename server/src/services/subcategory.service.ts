import prisma from "../config/prisma";

export const getSubcategoriesService = async () => {
  return prisma.subcategory.findMany({
    include: {
      category: true,
    },

    orderBy: {
      name: "asc",
    },
  });
};

export const createSubcategoryService = async (
  name: string,
  slug: string,
  categoryId: string,
) => {
  return prisma.subcategory.create({
    data: {
      name,
      slug,
      categoryId,
    },
  });
};

export const getSubcategoriesByCategoryService = async (categoryId: string) => {
  return prisma.subcategory.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const deleteSubcategoryService = async (id: string) => {
  return prisma.subcategory.delete({
    where: { id },
  });
};
