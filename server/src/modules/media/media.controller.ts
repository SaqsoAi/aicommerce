import { Request, Response } from "express";

import {
  getAllMedia,
  getProductImages,
  createProductImage,
  setThumbnailImage,
  reorderImages,
  deleteProductImage,
} from "./media.service";

// ================= GET ALL MEDIA =================

export const fetchMedia = async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      await getAllMedia();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch media",
    });
  }
};

// ================= GET PRODUCT IMAGES =================

export const fetchProductImages =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const productId =
        req.params.productId as string;

      const images =
        await getProductImages(
          productId
        );

      return res.status(200).json({
        success: true,
        data: images,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch product images",
      });
    }
  };

// ================= CREATE PRODUCT IMAGE =================

export const createImage =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const productId =
        req.params.productId as string;

      const image =
        await createProductImage(
          productId,
          req.body
        );

      return res.status(201).json({
        success: true,
        data: image,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to create image",
      });
    }
  };

// ================= SET THUMBNAIL =================

export const updateThumbnail =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const imageId =
        req.params.imageId as string;

      const image =
        await setThumbnailImage(
          imageId
        );

      return res.status(200).json({
        success: true,
        data: image,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error.message ??
          "Thumbnail update failed",
      });
    }
  };

// ================= REORDER =================

export const reorderProductImages =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await reorderImages(
        req.body.images || []
      );

      return res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Reorder failed",
      });
    }
  };

// ================= DELETE IMAGE =================

export const removeProductImage =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const imageId =
        req.params.imageId as string;

      await deleteProductImage(
        imageId
      );

      return res.status(200).json({
        success: true,
        message:
          "Image deleted successfully",
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Delete failed",
      });
    }
  };

// ================= UPLOAD FILE =================

export const uploadMedia = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File required",
      });
    }

    return res.status(200).json({
      success: true,
      url: req.file.path,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};