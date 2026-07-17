import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  generateCodes,
} from "./product-code.controller";

const router = Router();

router.get(
  "/generate",
  protect,
  permission(PERMISSIONS.PRODUCT_CREATE),
  generateCodes
);

export default router;
