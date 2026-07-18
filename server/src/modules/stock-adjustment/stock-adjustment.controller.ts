import type {
  Request,
  Response,
} from "express";

import {
  adjustVariantStock,
} from "./stock-adjustment.service";

export const adjustStockController = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await adjustVariantStock(req.body);

    return res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: result,
    });
  } catch (error: unknown) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Stock adjustment failed",
    });
  }
};
