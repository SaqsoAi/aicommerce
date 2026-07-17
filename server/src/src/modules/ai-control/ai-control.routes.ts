import express from "express";
import {
  createAiOverrideHandler,
  getAiControlDashboardHandler,
  getPublicAiAvailabilityHandler,
  logAiUsageHandler,
  seedAiControlHandler,
  updateAiFeatureHandler,
  updateAiProviderHandler,
} from "./ai-control.controller";

const router = express.Router();

router.post("/seed", seedAiControlHandler);
router.get("/dashboard", getAiControlDashboardHandler);
router.put("/features/:key", updateAiFeatureHandler);
router.put("/providers/:key", updateAiProviderHandler);
router.post("/usage", logAiUsageHandler);
router.post("/overrides", createAiOverrideHandler);
router.get("/public/availability", getPublicAiAvailabilityHandler);

export default router;