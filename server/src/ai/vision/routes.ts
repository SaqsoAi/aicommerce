import { Router } from "express";
import { aiVisionService } from "./service";
import type { AiVisionContext } from "./types";

const router = Router();

function contextFromRequest(req: any): AiVisionContext {
  return {
    userId: req.user?.id || req.userId,
    tenantId: req.user?.tenantId || req.tenantId,
    role: req.user?.role,
    products: Array.isArray(req.body?.products) ? req.body.products : [],
    product: req.body?.product || null,
    featureFlags: req.body?.featureFlags || {},
    membershipTier: req.body?.membershipTier || null,
  };
}

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    module: "ai-vision-platform",
    phase: "6.5",
    gatewayOnly: true,
    directProviderCalls: false,
    duplicateTryOnEngine: false,
    duplicateMediaEngine: false,
  });
});

router.post("/visual-safety", async (req, res, next) => {
  try {
    res.json(await aiVisionService.visualSafetyGuard(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/image-search", async (req, res, next) => {
  try {
    res.json(await aiVisionService.imageSearch(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/ocr-search", async (req, res, next) => {
  try {
    res.json(await aiVisionService.ocrSearch(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/product-image-analysis", async (req, res, next) => {
  try {
    res.json(await aiVisionService.productImageAnalysis(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/product-attribute-detection", async (req, res, next) => {
  try {
    res.json(await aiVisionService.productAttributeDetection(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/face-shape", async (req, res, next) => {
  try {
    res.json(await aiVisionService.faceShapeFoundation(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/skin-tone", async (req, res, next) => {
  try {
    res.json(await aiVisionService.skinToneFoundation(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/background-removal", async (req, res, next) => {
  try {
    res.json(await aiVisionService.backgroundRemovalFoundation(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/lifestyle-image", async (req, res, next) => {
  try {
    res.json(await aiVisionService.lifestyleImageFoundation(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/model-generation", async (req, res, next) => {
  try {
    res.json(await aiVisionService.modelGenerationFoundation(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.post("/virtual-tryon-foundation", async (req, res, next) => {
  try {
    res.json(await aiVisionService.virtualTryOnFoundation(req.body || {}, contextFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

export default router;