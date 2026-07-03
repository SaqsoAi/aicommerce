import { Router } from "express";
import {
  getActivity,
  getPreferences,
  getProfile,
  getRecommendations,
  refreshStyle,
  savePreference,
} from "./customer-intelligence.controller";

const router = Router();

router.get("/profile", getProfile);
router.get("/activity", getActivity);
router.get("/preferences", getPreferences);
router.post("/preferences", savePreference);
router.post("/style/refresh", refreshStyle);
router.get("/recommendations", getRecommendations);

export default router;
