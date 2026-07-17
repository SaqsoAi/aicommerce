import type {
  Request,
  Response,
} from "express";

import {
  generateProductContent,
} from "./ai-content.service";

export const generateContent =
async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      await generateProductContent(
        req.body
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Generation failed",
    });
  }
};
