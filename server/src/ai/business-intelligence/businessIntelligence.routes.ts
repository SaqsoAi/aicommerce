import { Router } from "express";
import { aiBusinessIntelligenceService } from "./businessIntelligence.service";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    module: "enterprise-ai-business-intelligence",
    phase: "6.7",
    gatewayRequired: true,
    liveMutation: false,
    autoPurchaseOrder: false,
  });
});

router.post("/forecast", async (req, res, next) => {
  try {
    const result = await aiBusinessIntelligenceService.forecast(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/executive-summary", async (req, res, next) => {
  try {
    const result = await aiBusinessIntelligenceService.executiveSummary(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/what-if", async (req, res, next) => {
  try {
    const result = await aiBusinessIntelligenceService.whatIf(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
