import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  getCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service";
import {
  getSubcategoriesService,
  getSubcategoriesByCategoryService,
  createSubcategoryService,
  deleteSubcategoryService,
} from "../services/subcategory.service";

const normalizeCategoryPayload = (payload: any) => {
  const normalize = (item: any) => {
    if (!item || typeof item !== "object") return item;
    const image = item.image || item.imageUrl || item.thumbnail || item.icon || null;
    return {
      ...item,
      image,
      imageUrl: image,
      thumbnail: image,
    };
  };

  if (Array.isArray(payload)) return payload.map(normalize);
  return normalize(payload);
};
// ================= CATEGORY =================

export const createCategory = async (req: Request, res: Response) => {
  try {
    const data = await createCategoryService(
      req.body.name,
      req.body.slug,
      req.body.image,
    );

    return res.status(201).json({
      success: true,
      data: normalizeCategoryPayload(data),
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const data = await getCategoriesService(req.query.search as string);

    return res.json({
      success: true,
      data: normalizeCategoryPayload(data),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const data = await updateCategoryService(
      String(req.params.id),
      req.body.name,
      req.body.slug,
      req.body.image,
    );

    return res.json({
      success: true,
      data: normalizeCategoryPayload(data),
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await deleteCategoryService(String(req.params.id));

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

// ================= SUBCATEGORY =================

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const data = await createSubcategoryService(
      req.body.name,
      req.body.slug,
      req.body.categoryId,
    );

    return res.status(201).json({
      success: true,
      data: normalizeCategoryPayload(data),
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const data = await getSubcategoriesService();

    return res.json({
      success: true,
      data: normalizeCategoryPayload(data),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSubcategoriesByCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getSubcategoriesByCategoryService(
      String(req.params.categoryId),
    );

    return res.json({
      success: true,
      data: normalizeCategoryPayload(data),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    await deleteSubcategoryService(String(req.params.id));

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
