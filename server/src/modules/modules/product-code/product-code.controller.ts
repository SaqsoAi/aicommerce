import {
  Request,
  Response,
} from "express";

import {
  generateCodesService,
} from "./product-code.service";

export const generateCodes =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await generateCodesService();

      return res.json({
        success: true,
        data,
      });
    } catch {
      return res.status(500).json({
        success: false,
      });
    }
  };