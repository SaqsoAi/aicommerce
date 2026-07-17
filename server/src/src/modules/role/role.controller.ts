import { Request, Response } from "express";
import { getRolesService } from "./role.service";

export const getRolesController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getRolesService();

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
