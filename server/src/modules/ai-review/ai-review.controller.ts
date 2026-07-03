import type { Request, Response } from "express";
import { summarizeProductReviews } from "./ai-review.service";

export const summarizeReviewsController = async (
  req: Request,
  res: Response
) => {
  try {
    const productId = String(req.params.productId || "");

    const data = await summarizeProductReviews(productId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Review summarization failed",
    });
  }
};
