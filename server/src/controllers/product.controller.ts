import { Request, Response } from "express";

import prisma from "../config/prisma";

import { createEmbedding } from "../ai/vector/embedding";

import { storeProductVector } from "../ai/vector/product.vector";

import {
  archiveProductService,
  createProductService,
  getProductsService,
  getFeaturedProductsService,
  getTrendingProductsService,
  getProductByIdService,
  updateProductService,
  updateProductStatusService,
  duplicateProductService,
  updateProductSeoService,
  updateProductGalleryService,
  updateProductSpecificationsService,
  updateProductAttributesService,
} from "../services/product.service";

import { productSchema, productUpdateSchema } from "../validators/product.validator";

const sendServerError = (res: Response, error: any, fallback: string) => {
  console.error(error);

  return res.status(500).json({
    success: false,
    message: error?.message || fallback,
  });
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await getProductsService();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Failed to fetch products");
  }
};

export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const products = await getFeaturedProductsService();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Failed to fetch featured products");
  }
};

export const getTrendingProducts = async (req: Request, res: Response) => {
  try {
    const products = await getTrendingProductsService();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Failed to fetch trending products");
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const product = await getProductByIdService(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Failed to fetch product");
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const validated = productSchema.parse(req.body);

    const product = await createProductService(validated);

    try {
      const embedding = await createEmbedding(product.name);
      await storeProductVector(product, embedding);
    } catch (error: any) {
      console.log("AI Vector skipped:", error?.message || error);
    }

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    const isValidationError = error?.name === "ZodError";

    console.error(error);

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error?.message || "Failed to create product",
      issues: isValidationError ? error?.issues : undefined,
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id as string;
    const validated = productUpdateSchema.parse(req.body);

    const product = await updateProductService(productId, validated);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    const isValidationError = error?.name === "ZodError";

    console.error(error);

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error?.message || "Product update failed",
      issues: isValidationError ? error?.issues : undefined,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id as string;

    const product = await archiveProductService(productId);

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
      data: product,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Product archive failed");
  }
};

export const hardDeleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id as string;

    const orderItems = await prisma.orderItem.findFirst({
      where: { productId },
    });

    if (orderItems) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product: Product has associated order items",
      });
    }

    const cartItems = await prisma.cart.findFirst({
      where: { productId },
    });

    if (cartItems) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product: Product is in user carts",
      });
    }

    const wishlistItems = await prisma.wishlist.findFirst({
      where: { productId },
    });

    if (wishlistItems) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product: Product is in user wishlists",
      });
    }

    const reviews = await prisma.review.findFirst({
      where: { productId },
    });

    if (reviews) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product: Product has reviews",
      });
    }

    const inventoryTransactions =
      await prisma.inventoryTransaction.findFirst({
        where: { referenceId: productId },
      });

    if (inventoryTransactions) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product: Product has inventory transactions",
      });
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    return sendServerError(res, error, "Product delete failed");
  }
};

export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const product = await updateProductStatusService(req.params.id as string, req.body);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Product status update failed");
  }
};

export const duplicateProduct = async (req: Request, res: Response) => {
  try {
    const product = await duplicateProductService(req.params.id as string);

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Product duplicate failed");
  }
};

export const updateProductSeo = async (req: Request, res: Response) => {
  try {
    const product = await updateProductSeoService(req.params.id as string, req.body);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Product SEO update failed");
  }
};

export const updateProductGallery = async (req: Request, res: Response) => {
  try {
    const product = await updateProductGalleryService(
      req.params.id as string,
      req.body.gallery ?? []
    );

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Product gallery update failed");
  }
};

export const updateProductSpecifications = async (
  req: Request,
  res: Response
) => {
  try {
    const product = await updateProductSpecificationsService(
      req.params.id as string,
      req.body.specifications ?? []
    );

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Product specifications update failed");
  }
};

export const updateProductAttributes = async (req: Request, res: Response) => {
  try {
    const product = await updateProductAttributesService(
      req.params.id as string,
      req.body.attributes ?? []
    );

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return sendServerError(res, error, "Product attributes update failed");
  }
};
