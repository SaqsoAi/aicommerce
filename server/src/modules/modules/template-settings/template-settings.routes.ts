import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  getTemplateSettings,
  updateTemplateSettings,
} from "./template-settings.controller";

const router = Router();

router.get("/:template", protect, permission(PERMISSIONS.SETTINGS_READ), getTemplateSettings);
router.put("/:template", protect, permission(PERMISSIONS.SETTINGS_MANAGE), updateTemplateSettings);

export default router;
