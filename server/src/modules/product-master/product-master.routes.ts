import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  fetchProductMaster,
} from "./product-master.controller";

const router = Router();

router.post(
  "/fetch",
  protect,
  permission(PERMISSIONS.PRODUCT_READ),
  fetchProductMaster
);

export default router;
