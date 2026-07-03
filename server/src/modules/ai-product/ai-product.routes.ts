import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  generateProductAI,
} from "./ai-product.controller";

const router = Router();

router.post(
  "/generate",
  protect,
  permission(PERMISSIONS.AI_MANAGE),
  generateProductAI
);

export default router;
