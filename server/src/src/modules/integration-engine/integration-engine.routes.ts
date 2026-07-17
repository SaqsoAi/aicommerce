import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  getIntegrationConfigs,
  createIntegrationConfig,
  getIntegrationConfig,
  updateIntegrationConfig,
  deleteIntegrationConfig,
  barcodeLookup,
  styleLookup,
  autoFillByBarcode,
  autoFillByStyle,
  syncStock,
  syncProducts,
} from "./integration-engine.controller";

const router = Router();

router.get(
  "/config",
  protect,
  permission(PERMISSIONS.INTEGRATION_READ),
  getIntegrationConfigs
);

router.post(
  "/config",
  protect,
  permission(PERMISSIONS.INTEGRATION_MANAGE),
  createIntegrationConfig
);

router.get(
  "/config/:id",
  protect,
  permission(PERMISSIONS.INTEGRATION_READ),
  getIntegrationConfig
);

router.put(
  "/config/:id",
  protect,
  permission(PERMISSIONS.INTEGRATION_MANAGE),
  updateIntegrationConfig
);

router.delete(
  "/config/:id",
  protect,
  permission(PERMISSIONS.INTEGRATION_MANAGE),
  deleteIntegrationConfig
);

router.get(
  "/barcode/:barcode",
  protect,
  permission(PERMISSIONS.INTEGRATION_READ),
  barcodeLookup
);

router.get(
  "/style/:styleNo",
  protect,
  permission(PERMISSIONS.INTEGRATION_READ),
  styleLookup
);

router.get(
  "/auto-fill/barcode/:barcode",
  protect,
  permission(PERMISSIONS.INTEGRATION_READ),
  autoFillByBarcode
);

router.get(
  "/auto-fill/style/:styleNo",
  protect,
  permission(PERMISSIONS.INTEGRATION_READ),
  autoFillByStyle
);

router.post(
  "/sync-stock",
  protect,
  permission(PERMISSIONS.INTEGRATION_MANAGE),
  syncStock
);

router.post(
  "/sync-products",
  protect,
  permission(PERMISSIONS.INTEGRATION_MANAGE),
  syncProducts
);

export default router;
