import { Request, Response } from "express";
import prisma from "../../config/prisma";

// ðŸš€ ACTIVATE
export const activateTemplate = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const updated = await prisma.installedTemplate.update({
      where: { id },
      data: { status: "active" },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Activate failed",
    });
  }
};

// âŒ DEACTIVATE
export const deactivateTemplate = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const updated = await prisma.installedTemplate.update({
      where: { id },
      data: { status: "inactive" },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Deactivate failed",
    });
  }
};

// ðŸ”„ ROLLBACK
export const rollbackTemplate = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const updated = await prisma.installedTemplate.update({
      where: { id },
      data: { status: "draft" },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Rollback failed",
    });
  }
};