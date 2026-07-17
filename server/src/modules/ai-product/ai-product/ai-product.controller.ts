import {
  Request,
  Response,
} from "express";

import {
  generateProductContent,
} from "./ai-product.service";

export const generateProductAI =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        name,
        category,
        brand,
      } = req.body;

      const data =
        await generateProductContent(
          name,
          category,
          brand
        );

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