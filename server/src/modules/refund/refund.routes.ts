import { Router } from "express";
import { PERMISSIONS } from "../../constants/permissions";
import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import {
  createRefundRequestController,
  getMyRefundRequestsController,
  getRefundRequestsController,
  updateRefundStatusController,
} from "./refund.controller";

const router = Router();

router.post("/", protect, createRefundRequestController);
router.get("/me", protect, getMyRefundRequestsController);
router.get("/", protect, permission(PERMISSIONS.ORDER_UPDATE), getRefundRequestsController);
router.patch("/:id/status", protect, permission(PERMISSIONS.ORDER_UPDATE), updateRefundStatusController);

export default router;



