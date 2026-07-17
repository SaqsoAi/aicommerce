import { Request, Response } from "express";

export const installTemplate = async (req: Request, res: Response) => {
  try {
    const { templateSlug } = req.body;

    // TODO: save to DB
    return res.json({
      success: true,
      message: "Template installed",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Install failed",
    });
  }
};

export const uninstallTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    return res.json({
      success: true,
      message: `Template ${id} uninstalled`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Uninstall failed",
    });
  }
};

export const getInstalledTemplates = async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: [],
  });
};