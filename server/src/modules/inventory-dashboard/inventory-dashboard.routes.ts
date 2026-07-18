import { Router } from "express";

import {
  getInventoryStats,
  getInventoryAnalytics,
  getInventoryHistory,
  getLowStock,
  getOutOfStock,
  getSupplierReturns,
  getInventoryForecast,
} from "./inventory-dashboard.controller";

const router = Router();

router.get(
  "/stats",
  getInventoryStats
);

router.get(
  "/analytics",
  getInventoryAnalytics
);

router.get(
  "/history",
  getInventoryHistory
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
  "/supplier-returns",
  getSupplierReturns
);

export default router;
