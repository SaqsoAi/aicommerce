import { Request, Response } from "express";
import { landingService } from "./landing.service";
import {
  landingCreateSchema,
  landingPublishSchema,
  landingUpdateSchema,
} from "./landing.validation";
import type { LandingPageInput } from "./landing.types";

function getParam(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

export const landingController = {
  async list(_req: Request, res: Response) {
    const data = await landingService.list();
    return res.json({ success: true, data });
  },

  async getById(req: Request, res: Response) {
    const id = getParam(req.params.id);
    const data = await landingService.getById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found",
      });
    }

    return res.json({ success: true, data });
  },

  async getBySlug(req: Request, res: Response) {
    const slug = getParam(req.params.slug);
    const data = await landingService.getBySlug(slug);

    if (!data || !data.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Landing page not found or not published",
      });
    }

    return res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    const payload = landingCreateSchema.parse(req.body) as LandingPageInput;
    const data = await landingService.create(payload);

    return res.status(201).json({
      success: true,
      message: "Landing page created",
      data,
    });
  },

  async update(req: Request, res: Response) {
    const id = getParam(req.params.id);
    const payload = landingUpdateSchema.parse(req.body) as Partial<LandingPageInput>;
    const data = await landingService.update(id, payload);

    return res.json({
      success: true,
      message: "Landing page updated",
      data,
    });
  },

  async remove(req: Request, res: Response) {
    const id = getParam(req.params.id);
    await landingService.remove(id);

    return res.json({
      success: true,
      message: "Landing page deleted",
    });
  },

  async publish(req: Request, res: Response) {
    const id = getParam(req.params.id);
    const payload = landingPublishSchema.parse(req.body ?? {});
    const data = await landingService.publish(
      id,
      payload.publishedBy,
      payload.note
    );

    return res.json({
      success: true,
      message: "Landing page published",
      data,
    });
  },

  async unpublish(req: Request, res: Response) {
    const id = getParam(req.params.id);
    const payload = landingPublishSchema.parse(req.body ?? {});
    const data = await landingService.unpublish(
      id,
      payload.publishedBy,
      payload.note
    );

    return res.json({
      success: true,
      message: "Landing page unpublished",
      data,
    });
  },
};
