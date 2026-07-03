import express from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  getSocialFeedSettings,
  updateSocialFeedSettings,
} from "./social-feed-settings.controller";

const router = express.Router();

router.get("/", protect, permission(PERMISSIONS.SETTINGS_READ), getSocialFeedSettings);
router.put("/", protect, permission(PERMISSIONS.SETTINGS_MANAGE), updateSocialFeedSettings);

export default router;
