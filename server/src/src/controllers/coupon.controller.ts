import { Request, Response } from "express";

import prisma from "../config/prisma";

export const applyCoupon =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { code, total } =
        req.body;

      const coupon =
        await prisma.coupon.findUnique(
          {
            where: {
              code,
            },
          }
        );

      if (!coupon) {
        return res.status(404).json({
          message:
            "Coupon not found",
        });
      }

      const discount =
        (total * coupon.discount) /
        100;

      const finalPrice =
        total - discount;

      res.status(200).json({
        total,
        discount,
        finalPrice,
      });
    } catch (error: any) {
      res.status(500).json({
        message:
          "Coupon apply failed",
      });
    }
  };