import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  createPurchaseOrder,
  getGoodsReceiveNotes,
  getPurchaseOrders,
  getSupplierLedger,
  receivePurchaseOrder,
} from "./purchase.controller";

const router = Router();

router.get(
  "/",
  protect,
  permission(PERMISSIONS.ERP_READ),
  getPurchaseOrders
);

router.post(
  "/",
  protect,
  permission(PERMISSIONS.ERP_MANAGE),
  createPurchaseOrder
);

router.post(
  "/:id/receive",
  protect,
  permission(PERMISSIONS.ERP_MANAGE),
  receivePurchaseOrder
);

router.get(
  "/grn/list",
  protect,
  permission(PERMISSIONS.ERP_READ),
  getGoodsReceiveNotes
);

router.get(
  "/ledger/list",
  protect,
  permission(PERMISSIONS.ERP_READ),
  getSupplierLedger
);

export default router;
