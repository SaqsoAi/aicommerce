import { Router } from "express";
import { aiCreativeStudioService } from "../ai/creative";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    module: "enterprise-ai-creative-studio",
    phase: "6.8",
    gatewayOnly: true,
    mediaManagerReused: true,
    visionPlatformReused: true,
    noImageGenerationExecuted: true,
    noVideoGenerationExecuted: true,
  });
});

router.get("/templates", (_req, res) => {
  res.json({ success: true, templates: aiCreativeStudioService.listTemplates() });
});

router.post("/preview", async (req, res, next) => {
  try {
    const payload = await aiCreativeStudioService.generatePreview(req.body || {});
    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
});

export default router;
