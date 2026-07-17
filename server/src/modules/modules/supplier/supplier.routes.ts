import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} from "./supplier.controller";

const router = Router();

router.get(
  "/",
  protect,
  permission(PERMISSIONS.ERP_READ),
  getSuppliers
);

router.post(
  "/",
  protect,
  permission(PERMISSIONS.ERP_MANAGE),
  createSupplier
);

router.put(
  "/:id",
  protect,
  permission(PERMISSIONS.ERP_MANAGE),
  updateSupplier
);

router.delete(
  "/:id",
  protect,
  permission(PERMISSIONS.ERP_MANAGE),
  deleteSupplier
);

export default router;
