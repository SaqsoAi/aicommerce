import prisma from '../../config/prisma';
import crypto from "crypto";

export const getHomepageSectionsService = async () => {
  return prisma.homepageSection.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
  });
};

export const getActiveHomepageSectionsService = async () => {
  return prisma.homepageSection.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });
};

export const createHomepageSectionService = async (data: any) => {
  return prisma.homepageSection.create({
    data: {
      id: crypto.randomUUID(),
      
      title: data.title,
      slug: data.slug,
      type: data.type,

      enabled: data.enabled ?? true,
      
      sortOrder: data.sortOrder ?? 0,
      
      data: data.data ?? {},
      
      updatedAt: new Date(),
    },
  });
};

export const updateHomepageSectionService = async (
  id: string,
  data: any
) => {
  return prisma.homepageSection.update({
    where: {
      id,
    },
    data: {
      title: data.title ?? undefined,
      slug: data.slug ?? undefined,
      type: data.type ?? undefined,
      enabled: data.enabled ?? undefined,
      sortOrder: data.sortOrder ?? undefined,
      data: data.data ?? undefined,
    },
  });
};

export const deleteHomepageSectionService = async (id: string) => {
  return prisma.homepageSection.delete({
    where: {
      id,
    },
  });
};

export const reorderHomepageSectionsService =
async (
  items: {
    id: string;
    sortOrder: number;
  }[]
) => {
  const updates =
    items.map((item) =>
      prisma.homepageSection.update({
        where: {
          id: item.id,
        },
        data: {
          sortOrder: Number(item.sortOrder),
        },
      })
    );

  await prisma.$transaction(updates);

  return prisma.homepageSection.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const toggleHomepageSectionService =
async (
  id: string,
  enabled: boolean
) => {
  return prisma.homepageSection.update({
    where: {
      id,
    },
    data: {
      enabled,
    },
  });
};

