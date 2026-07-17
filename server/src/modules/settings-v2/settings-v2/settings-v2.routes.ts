import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  getSettingsV2Controller,
  seedSettingsV2Controller,
  updateSettingsV2Controller,
} from "./settings-v2.controller";

const router = Router();

router.get("/", protect, permission(PERMISSIONS.SETTINGS_READ), getSettingsV2Controller);
router.post("/seed", protect, permission(PERMISSIONS.SETTINGS_MANAGE), seedSettingsV2Controller);
router.put("/", protect, permission(PERMISSIONS.SETTINGS_MANAGE), updateSettingsV2Controller);

export default router;
