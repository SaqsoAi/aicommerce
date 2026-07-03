import { Router, type Request, type Response } from "express";

import prisma from "../../prisma/prisma";
import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  createHero,
  getHeroes,
  getHeroById,
  updateHero,
  deleteHero,
} from "./hero.controller";

const router = Router();

router.post("/", protect, permission(PERMISSIONS.CONTENT_MANAGE), createHero);

router.get("/", getHeroes);

router.get("/:id", getHeroById);

router.put("/:id", protect, permission(PERMISSIONS.CONTENT_MANAGE), updateHero as any);

router.delete("/:id", protect, permission(PERMISSIONS.CONTENT_MANAGE), deleteHero as any);

router.patch(
  "/:id/toggle",
  protect,
  permission(PERMISSIONS.CONTENT_MANAGE),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;

      const hero = await prisma.hero.findUnique({
        where: { id },
      });

      if (!hero) {
        return res.status(404).json({
          success: false,
          message: "Hero not found",
        });
      }

      const updatedHero = await prisma.hero.update({
        where: { id },
        data: {
          active: !hero.active,
        },
      });

      return res.status(200).json({
        success: true,
        data: updatedHero,
      });
    } catch (error: unknown) {
      console.error("Toggle Hero Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to toggle hero",
      });
    }
  }
);

export default router;
