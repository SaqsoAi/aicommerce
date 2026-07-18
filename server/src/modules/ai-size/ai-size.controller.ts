import type { Request, Response } from "express";
import { sizeRecommender } from "../../ai/size.recommender";

export const predictSize = async (
  req: Request,
  res: Response
) => {
  try {
    const height = Number(req.body.height || 0);
    const weight = Number(req.body.weight || 0);

    if (height <= 0 || weight <= 0) {
      return res.status(400).json({
        success: false,
        message: "Height and weight are required",
      });
    }

    const size = sizeRecommender.getSmartSize({
      height,
      weight,
    });

    return res.json({
      success: true,
      data: {
        recommendedSize: size,
        height,
        weight,
        message: `Recommended size is ${size}`,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Size prediction failed",
    });
  }
};
