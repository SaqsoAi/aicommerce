import express from "express";

import { protect } from "../modules/auth/auth.middleware";
import { permission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

import {
  getInventory,
  getInventoryStats,
  getLowStock,
  getOutOfStock,
  getInventoryHistory,
  getReconciliation,
} from "../controllers/inventory.controller";

const router = express.Router();

router.get(
  "/",
  protect,
  permission(PERMISSIONS.INVENTORY_READ),
  getInventory
);

router.get(
  "/stats",
  protect,
  permission(PERMISSIONS.INVENTORY_READ),
  getInventoryStats
);

router.get(
  "/low-stock",
  protect,
  permission(PERMISSIONS.INVENTORY_READ),
  getLowStock
);

router.get(
  "/out-of-stock",
  protect,
  permission(PERMISSIONS.INVENTORY_READ),
  getOutOfStock
);

router.get(
  "/history",
  protect,
  permission(PERMISSIONS.INVENTORY_READ),
  getInventoryHistory
);

router.get(
  "/reconciliation",
  protect,
  permission(PERMISSIONS.INVENTORY_READ),
  getReconciliation
);

export default router;
