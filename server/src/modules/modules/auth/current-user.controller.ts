import {
  Response,
} from "express";

import prisma from "../../config/prisma";

import {
  AuthRequest,
} from "./auth.middleware";

export const getCurrentUser =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id:
              req.user.id,
          },
        });

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch {
      return res.status(500).json({
        success: false,
      });
    }
  };