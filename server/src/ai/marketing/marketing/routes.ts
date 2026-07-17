import { Router } from "express";
import { aiMarketingAutomationService } from "./service";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    module: "enterprise-ai-marketing-automation",
    phase: "6.9",
    gatewayOnly: true,
    humanApprovalFirst: true,
    noAutoSend: true,
    noAutoPublish: true,
  });
});

router.post("/draft", async (req, res, next) => {
  try {
    const result = await aiMarketingAutomationService.generateDraft(req.body || {}, {
      tenantId: req.headers["x-tenant-id"] ? String(req.headers["x-tenant-id"]) : undefined,
      userId: (req as any).user?.id,
      customerSegment: req.body?.audience,
      campaignEngineAvailable: true,
      notificationEngineAvailable: true,
      contentStudioAvailable: true,
      creativeStudioAvailable: true,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;