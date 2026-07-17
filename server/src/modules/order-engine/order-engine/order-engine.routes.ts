import express from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  updateOrderStatusController,
  assignCourierController,
  createTrackingController,
  getOrderTimelineController,
  generateInvoiceController,
  getInvoiceController,
  createReturnRequestController,
  updateReturnRequestController,
  getReturnRequestsController,
  createRefundRequestController,
  updateRefundRequestController,
  getRefundRequestsController,
} from "./order-engine.controller";

const router = express.Router();

router.patch(
  "/:orderId/status",
  protect,
  permission(PERMISSIONS.ORDER_MANAGE),
  updateOrderStatusController
);

router.post(
  "/:orderId/courier",
  protect,
  permission(PERMISSIONS.ORDER_MANAGE),
  assignCourierController
);

router.post(
  "/:orderId/tracking",
  protect,
  permission(PERMISSIONS.ORDER_MANAGE),
  createTrackingController
);

router.get(
  "/:orderId/timeline",
  protect,
  permission(PERMISSIONS.ORDER_READ),
  getOrderTimelineController
);

router.post(
  "/:orderId/invoice",
  protect,
  permission(PERMISSIONS.ORDER_MANAGE),
  generateInvoiceController
);

router.get(
  "/:orderId/invoice",
  protect,
  permission(PERMISSIONS.ORDER_READ),
  getInvoiceController
);

router.post(
  "/:orderId/return",
  protect,
  createReturnRequestController
);

router.patch(
  "/return/:id",
  protect,
  permission(PERMISSIONS.ORDER_MANAGE),
  updateReturnRequestController
);

router.get(
  "/returns/list",
  protect,
  permission(PERMISSIONS.ORDER_READ),
  getReturnRequestsController
);

router.post(
  "/:orderId/refund",
  protect,
  createRefundRequestController
);

router.patch(
  "/refund/:id",
  protect,
  permission(PERMISSIONS.ORDER_MANAGE),
  updateRefundRequestController
);

router.get(
  "/refunds/list",
  protect,
  permission(PERMISSIONS.ORDER_READ),
  getRefundRequestsController
);

export default router;
