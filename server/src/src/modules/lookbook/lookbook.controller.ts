import { Request, Response } from "express";
import {
  createLookbookSchema,
  publishLookbookSchema,
  updateLookbookSchema,
} from "./lookbook.validation";
import * as lookbookService from "./lookbook.service";

const getParam = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
};

export const listLookbooks = async (_req: Request, res: Response) => {
  const data = await lookbookService.getLookbooks();

  res.json({
    success: true,
    data,
  });
};

export const listPublishedLookbooks = async (_req: Request, res: Response) => {
  const data = await lookbookService.getPublishedLookbooks();

  res.json({
    success: true,
    data,
  });
};

export const getLookbook = async (req: Request, res: Response) => {
  const slug = getParam(req.params.slug);

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Lookbook slug is required",
    });
  }

  const data = await lookbookService.getLookbookBySlug(slug);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Lookbook not found",
    });
  }

  res.json({
    success: true,
    data,
  });
};

export const createLookbook = async (req: Request, res: Response) => {
  const payload = createLookbookSchema.parse(req.body);
  const data = await lookbookService.createLookbook(payload);

  res.status(201).json({
    success: true,
    data,
  });
};

export const updateLookbook = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Lookbook id is required",
    });
  }

  const payload = updateLookbookSchema.parse(req.body);
  const data = await lookbookService.updateLookbook(id, payload);

  res.json({
    success: true,
    data,
  });
};

export const deleteLookbook = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Lookbook id is required",
    });
  }

  await lookbookService.deleteLookbook(id);

  res.json({
    success: true,
    message: "Lookbook deleted",
  });
};

export const publishLookbook = async (req: Request, res: Response) => {
  const id = getParam(req.params.id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Lookbook id is required",
    });
  }

  const payload = publishLookbookSchema.parse(req.body);
  const data = await lookbookService.publishLookbook(id, payload.published);

  res.json({
    success: true,
    data,
  });
};
