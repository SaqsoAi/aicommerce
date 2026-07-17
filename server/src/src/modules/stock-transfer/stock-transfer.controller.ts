import type {
  Request,
  Response,
} from "express";

import {
  transferVariantStock,
} from "./stock-transfer.service";

export const transferStockController = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await transferVariantStock(req.body);

    return res.status(200).json({
      success: true,
      message: "Stock transferred successfully",
      data: result,
    });
  } catch (error: unknown) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Stock transfer failed",
    });
  }
};
