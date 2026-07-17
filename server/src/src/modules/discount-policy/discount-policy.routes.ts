import { Router } from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  getDiscountPolicy,
  updateDiscountPolicy,
} from "./discount-policy.controller";

const router = Router();

router.get("/", protect, permission(PERMISSIONS.SETTINGS_READ), getDiscountPolicy);
router.put("/", protect, permission(PERMISSIONS.SETTINGS_MANAGE), updateDiscountPolicy);

export default router;
