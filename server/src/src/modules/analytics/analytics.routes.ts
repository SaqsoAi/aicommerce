import { Router } from "express";

import {
  fetchAnalytics,
  fetchSalesForecast,
  fetchSavedLooksAnalytics,
  fetchVirtualTryOnAnalytics,
} from "./analytics.controller";

const router = Router();

router.get("/", fetchAnalytics);

router.get("/forecast", fetchSalesForecast);

router.get("/saved-looks", fetchSavedLooksAnalytics);

router.get("/virtual-tryon", fetchVirtualTryOnAnalytics);

export default router;
