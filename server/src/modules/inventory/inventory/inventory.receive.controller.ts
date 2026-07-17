import {
  Request,
  Response,
} from "express";

import {
  receiveInventoryService,
} from "./inventory.receive.service";

export const receiveInventory =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        variantId,
        quantity,
        referenceId,
        notes,
      } = req.body;

      const result =
        await receiveInventoryService(
          variantId,
          Number(quantity),
          referenceId,
          notes
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };