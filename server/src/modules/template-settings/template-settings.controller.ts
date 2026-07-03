import { Request, Response } from "express";
import prisma from "../../config/prisma";

// ðŸ“¥ GET SETTINGS
export const getTemplateSettings = async (req: Request, res: Response) => {
  try {
    const template = String(req.params.template);

    const settings = await prisma.templateSettings.findUnique({
      where: {
        template,
      },
    });

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

// ðŸ”„ UPDATE SETTINGS
export const updateTemplateSettings = async (req: Request, res: Response) => {
  try {
    const template = String(req.params.template);
    const { config } = req.body;

    const updated = await prisma.templateSettings.upsert({
      where: {
        template,
      },
      update: {
        config,
      },
      create: {
        template,
        config,
      },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};