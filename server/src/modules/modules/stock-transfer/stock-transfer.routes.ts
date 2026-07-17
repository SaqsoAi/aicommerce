import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  transferStockController,
} from "./stock-transfer.controller";

const router = Router();

router.post(
  "/",
  protect,
  permission(PERMISSIONS.INVENTORY_MANAGE),
  transferStockController
);

export default router;
