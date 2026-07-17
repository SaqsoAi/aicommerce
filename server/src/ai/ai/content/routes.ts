import { Router } from "express";
import { aiContentStudioService } from "./service";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, module: "ai-content-studio", phase: "6.6", gatewayOnly: true, imageGeneration: false, videoGeneration: false });
});

router.post("/product-content", async (req, res, next) => {
  try {
    const draft = await aiContentStudioService.generateProductContent(req.body || {});
    res.json({ success: true, draft });
  } catch (error) {
    next(error);
  }
});

export default router;
