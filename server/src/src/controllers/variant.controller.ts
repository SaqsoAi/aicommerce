import {
  Request,
  Response,
} from "express";

import prisma from "../config/prisma";

export const updateVariantStock =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const variant =
        await prisma.productVariant.update({
          where: {
            id:
              req.params.id as string,
          },

          data: {
            stock:
              req.body.stock,
          },
        });

      res.status(200).json(
        variant
      );
    } catch (error: any) {
      console.log(error);

      res.status(500).json({
        message:
          "Stock update failed",
      });
    }
  };