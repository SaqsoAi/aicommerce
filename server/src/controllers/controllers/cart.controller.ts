import { Request, Response } from "express";

import prisma from "../config/prisma";

export const addToCart = async (
  req: Request,
  res: Response
) => {
  try {
    const cart =
      await prisma.cart.create({
        data: req.body,
      });

    res.status(201).json(cart);
  } catch (error: any) {
    res.status(500).json({
      message: "Add to cart failed",
    });
  }
};

export const getCartItems =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const items =
        await prisma.cart.findMany({
          include: {
            product: true,
          },
        });

      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({
        message:
          "Failed to fetch cart",
      });
    }
  };