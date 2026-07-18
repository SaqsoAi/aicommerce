import { Request, Response } from "express";
import prisma from "../config/prisma";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getParamId = (req: Request) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return "";
  }

  return id;
};

export const getSubcategories = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.subcategory.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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

export const getSubcategoryById = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory id",
      });
    }

    const data = await prisma.subcategory.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

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

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name || "").trim();
    const categoryId = String(req.body.categoryId || "").trim();

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Name and categoryId are required",
      });
    }

    const slug =
      String(req.body.slug || "").trim() ||
      slugify(`${categoryId}-${name}`);

    const data = await prisma.subcategory.create({
      data: {
        name,
        slug,
        categoryId,
      },
      include: {
        category: true,
      },
    });

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

export const updateSubcategory = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory id",
      });
    }

    const name =
      req.body.name !== undefined
        ? String(req.body.name).trim()
        : undefined;

    const categoryId =
      req.body.categoryId !== undefined
        ? String(req.body.categoryId).trim()
        : undefined;

    const slug =
      req.body.slug !== undefined
        ? String(req.body.slug).trim()
        : name
          ? slugify(`${categoryId || "subcategory"}-${name}`)
          : undefined;

    const data = await prisma.subcategory.update({
      where: {
        id,
      },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
      },
    });

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

export const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid subcategory id",
      });
    }

    const productCount = await prisma.product.count({
      where: {
        subcategoryId: id,
      },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This subcategory has products. Move or delete products first.",
      });
    }

    await prisma.subcategory.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
