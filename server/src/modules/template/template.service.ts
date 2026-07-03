import prisma from "../../prisma/prisma";

export const getTemplates = async () => {
  return prisma.storeTemplate.findMany({
    include: {
      template: true,
      store: true,
    },
  });
};

export const activateTemplate = async (
  storeId: string,
  templateId: string
) => {
  await prisma.storeTemplate.updateMany({
    where: {
      storeId,
    },
    data: {
      isActive: false,
    },
  });

  return prisma.storeTemplate.update({
    where: {
      storeId_templateId: {
        storeId,
        templateId,
      },
    },
    data: {
      isActive: true,
    },
    include: {
      template: true,
      store: true,
    },
  });
};

export const getActiveTemplate = async (
  storeId: string
) => {
  return prisma.storeTemplate.findFirst({
    where: {
      storeId,
      isActive: true,
    },
    include: {
      template: true,
    },
  });
};