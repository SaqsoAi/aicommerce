import { Request, Response } from "express";

import {
  getHomepageSectionsService,
  getActiveHomepageSectionsService,
  createHomepageSectionService,
  updateHomepageSectionService,
  deleteHomepageSectionService,
  reorderHomepageSectionsService,
  toggleHomepageSectionService,
} from './homepage-section.service';

import { homepageSectionSchema } from './homepage-section.validation';

export const getHomepageSections = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getHomepageSectionsService();

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveHomepageSections = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getActiveHomepageSectionsService();

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createHomepageSection = async (
  req: Request,
  res: Response
) => {
  try {
    const body = homepageSectionSchema.parse(req.body);

    const data = await createHomepageSectionService(body);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateHomepageSection = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await updateHomepageSectionService(
      String(req.params.id),
      req.body
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteHomepageSection = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteHomepageSectionService(String(req.params.id));

    return res.json({
      success: true,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const reorderHomepageSectionsController =
async (
  req: Request,
  res: Response
) => {
  try {
    const items =
      Array.isArray(req.body.items)
        ? req.body.items
        : [];

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "items array is required",
      });
    }

    const data =
      await reorderHomepageSectionsService(items);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleHomepageSectionController =
async (
  req: Request,
  res: Response
) => {
  try {
    const id =
      String(req.params.id || "");

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Section id is required",
      });
    }

    const data =
      await toggleHomepageSectionService(
        id,
        Boolean(req.body.enabled)
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};








