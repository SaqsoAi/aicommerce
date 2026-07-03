import { Router } from "express";
import {
  createVirtualTryOn,
  getMyVirtualTryOnList,
  getVirtualTryOn,
  getVirtualTryOnList,
  getVirtualTryOnSettingController,
  removeMyVirtualTryOn,
  removeVirtualTryOn,
  retryMyVirtualTryOn,
  updateVirtualTryOnSettingController,
} from "./virtualTryOn.controller";
import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    module: "virtual-tryon",
  });
});

router.get("/settings", getVirtualTryOnSettingController);
router.put(
  "/settings",
  protect,
  permission(PERMISSIONS.AI_ADMIN),
  updateVirtualTryOnSettingController
);

router.post(
  "/create",
  protect,
  permission(PERMISSIONS.AI_USE),
  createVirtualTryOn
);

router.get("/history/me", protect, permission(PERMISSIONS.AI_USE), getMyVirtualTryOnList);
router.get("/history", protect, permission(PERMISSIONS.AI_READ), getVirtualTryOnList);
router.post("/history/:id/retry", protect, permission(PERMISSIONS.AI_USE), retryMyVirtualTryOn);
router.delete("/history/:id", protect, permission(PERMISSIONS.AI_USE), removeMyVirtualTryOn);

router.get("/:id", getVirtualTryOn);
router.delete("/:id", protect, permission(PERMISSIONS.AI_ADMIN), removeVirtualTryOn);

export default router;
