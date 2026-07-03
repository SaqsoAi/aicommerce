import { Request, Response } from "express";
import { getPermissionsService } from "./permission.service";

export const getPermissionsController =
async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      await getPermissionsService();

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
