import express from "express";
import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";
import {
  getPublicFeatureFlagsHandler,
  getTenantUsageHandler,
  listFeatureFlagsHandler,
  listPlansHandler,
  seedSaasFoundationHandler,
  updateFeatureFlagHandler,
  updatePlanHandler,
  updateTenantQuotaHandler,
  evaluateTenantQuotaHandler,
} from "./saas-foundation.controller";

const router = express.Router();

router.get("/public/features", getPublicFeatureFlagsHandler);

router.post("/seed", protect, permission(PERMISSIONS.AI_MANAGE), seedSaasFoundationHandler);

router.get("/feature-flags", protect, permission(PERMISSIONS.FEATURE_READ), listFeatureFlagsHandler);
router.post("/feature-flags", protect, permission(PERMISSIONS.FEATURE_MANAGE), updateFeatureFlagHandler);

router.get("/plans", protect, permission(PERMISSIONS.SUBSCRIPTION_READ), listPlansHandler);
router.post("/plans", protect, permission(PERMISSIONS.SUBSCRIPTION_MANAGE), updatePlanHandler);

router.get("/tenant-usage/:tenantId", protect, permission(PERMISSIONS.BILLING_READ), getTenantUsageHandler);
router.post("/tenant-quotas", protect, permission(PERMISSIONS.BILLING_MANAGE), updateTenantQuotaHandler);

router.get("/tenant-quota-check/:tenantId/:metric", protect, permission(PERMISSIONS.BILLING_READ), evaluateTenantQuotaHandler);

export default router;