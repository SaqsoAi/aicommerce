import { Router } from "express";

import {
  getInventory,
  getLowStock,
  getOutOfStock,
  getInventoryHistory,
} from "./inventory.controller";

import {
  getInventoryAnalytics,
} from "./inventory.analytics.controller";

const router = Router();

router.get(
  "/",
  getInventory
);

router.get(
  "/low-stock",
  getLowStock
);

router.get(
  "/out-of-stock",
  getOutOfStock
);

router.get(
  "/history",
  getInventoryHistory
);

router.get(
  "/analytics",
  getInventoryAnalytics
);

export default router;