import express from "express";

import { protect } from "../modules/auth/auth.middleware";
import { permission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";

import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderTimeline,
  addOrderNote,
  updateOrderStatus,
  getOrderTracking,
  getOrderAnalytics,
} from "../controllers/order.controller";

const router = express.Router();

// CREATE ORDER
router.post("/", createOrder);

// GET ALL ORDERS
router.get("/", protect, permission(PERMISSIONS.ORDER_READ), getOrders);

// USER ORDERS
router.get("/user/:userId", getOrders);

router.get("/analytics/overview", protect, permission(PERMISSIONS.ORDER_READ), getOrderAnalytics);

router.get("/:id", getOrderById);

router.get("/:id/timeline", getOrderTimeline);

router.get("/:id/tracking", getOrderTracking);

router.post("/:id/note", protect, permission(PERMISSIONS.ORDER_UPDATE), addOrderNote);

router.patch("/:id/status", protect, permission(PERMISSIONS.ORDER_UPDATE), updateOrderStatus);

export default router;
