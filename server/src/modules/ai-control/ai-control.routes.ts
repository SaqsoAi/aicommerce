import express from "express";
import {
  createAiOverrideHandler,
  getAiControlDashboardHandler,
  getAiSecretGovernanceHandler,
  getPublicAiAvailabilityHandler,
  logAiUsageHandler,
  seedAiControlHandler,
  updateAiFeatureHandler,
  updateAiProviderHandler,
  getAiPlatformRegistryHandler,
  saveAiEnterpriseSettingHandler,
  saveAiModelHandler,
  saveAiPolicyHandler,
  saveAiPromptHandler,
} from "./ai-control.controller";
import { protect } from "../auth/auth.middleware";
import { requirePlatformAdmin } from "../../middleware/authorize.middleware";

const router = express.Router();

// This is the only intentionally public route. It returns effective, non-secret
// availability and never exposes provider credentials or platform policy details.
router.get("/public/availability", getPublicAiAvailabilityHandler);

router.use(protect);
router.use(...(requirePlatformAdmin as any));
router.post("/seed", seedAiControlHandler);
router.get("/dashboard", getAiControlDashboardHandler);
router.get("/security-governance", getAiSecretGovernanceHandler);
router.get("/platform-registry", getAiPlatformRegistryHandler);
router.post("/platform-registry/prompts", saveAiPromptHandler);
router.post("/platform-registry/models", saveAiModelHandler);
router.put("/platform-registry/policies/:key", saveAiPolicyHandler);
router.put("/platform-registry/settings/:key", saveAiEnterpriseSettingHandler);
router.put("/features/:key", updateAiFeatureHandler);
router.put("/providers/:key", updateAiProviderHandler);
router.post("/usage", logAiUsageHandler);
router.post("/overrides", createAiOverrideHandler);

export default router;
