import { Request, Response } from "express";
import { sizeFitCenterService } from "./size-fit-center.service";
import type {
  FitReviewInput,
  SizeFitCenterSettingsInput,
} from "./size-fit-center.types";
import {
  fitReviewSchema,
  reviewActionSchema,
  sizeFitSettingsSchema,
} from "./size-fit-center.validation";

function getParam(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

export const sizeFitCenterController = {
  async getSettings(_req: Request, res: Response) {
    const data = await sizeFitCenterService.getSettings();
    return res.json({ success: true, data });
  },

  async updateSettings(req: Request, res: Response) {
    const payload = sizeFitSettingsSchema.parse(
      req.body
    ) as SizeFitCenterSettingsInput;

    const data = await sizeFitCenterService.updateSettings(payload);

    return res.json({
      success: true,
      message: "Size Fit Center settings updated",
      data,
    });
  },

  async getReviews(req: Request, res: Response) {
    const mode = String(req.query.mode || "public");

    const data =
      mode === "admin"
        ? await sizeFitCenterService.getAdminReviews()
        : await sizeFitCenterService.getApprovedReviews();

    return res.json({ success: true, data });
  },

  async submitReview(req: Request, res: Response) {
    const payload = fitReviewSchema.parse(req.body) as FitReviewInput;
    const data = await sizeFitCenterService.submitReview(payload);

    return res.status(201).json({
      success: true,
      message: "Fit review submitted for approval",
      data,
    });
  },

  async approveReview(req: Request, res: Response) {
    const id = getParam(req.params.id);
    const payload = reviewActionSchema.parse(req.body ?? {});
    const data = await sizeFitCenterService.approveReview(
      id,
      payload.value ?? true
    );

    return res.json({
      success: true,
      message: "Fit review approval updated",
      data,
    });
  },

  async featureReview(req: Request, res: Response) {
    const id = getParam(req.params.id);
    const payload = reviewActionSchema.parse(req.body ?? {});
    const data = await sizeFitCenterService.featureReview(
      id,
      payload.value ?? true
    );

    return res.json({
      success: true,
      message: "Fit review featured status updated",
      data,
    });
  },
};
