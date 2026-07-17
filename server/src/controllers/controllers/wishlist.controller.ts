import { Request, Response } from "express";
import prisma from "../config/prisma";

export const addToWishlist = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, productId } =
      req.body;

    const existing =
      await prisma.wishlist.findFirst({
        where: {
          userId,
          productId,
        },
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "Already in wishlist",
      });
    }

    const wishlist =
      await prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
      });

    return res.status(201).json({
      success: true,
      data: wishlist,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Wishlist add failed",
    });
  }
};

export const getWishlist =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        String(req.params.userId);

      const items =
        await prisma.wishlist.findMany({
          where: {
            userId,
          },

          include: {
            product: true,
          },
        });

      return res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Wishlist fetch failed",
      });
    }
  };

export const removeWishlist =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await prisma.wishlist.delete({
        where: {
          id: String(
            req.params.id
          ),
        },
      });

      return res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Wishlist delete failed",
      });
    }
  };