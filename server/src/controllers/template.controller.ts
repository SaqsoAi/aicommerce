import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getTemplates = async (
  req: Request,
  res: Response
) => {
  const templates =
    await prisma.storeTemplate.findMany();

  return res.json(templates);
};

export const getActiveTemplate = async (
  req: Request,
  res: Response
) => {
  const template =
    await prisma.storeTemplate.findFirst({
      where: {
        isActive: true,
      },
    });

  return res.json(template);
};

export const activateTemplate = async (
  req: Request,
  res: Response
) => {
  const { storeId, templateId } = req.body;

  await prisma.storeTemplate.updateMany({
    where: {
      storeId,
    },
    data: {
      isActive: false,
    },
  });

  const template =
    await prisma.storeTemplate.update({
      where: {
        storeId_templateId: {
          storeId,
          templateId,
        },
      },
      data: {
        isActive: true,
      },
    });

  return res.json(template);
};