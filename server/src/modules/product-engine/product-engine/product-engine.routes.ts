import express from "express";
import {
  createInventoryMovementHandler,
  getProductEngineViewHandler,
  upsertProductAiMetaHandler,
  upsertProductSeoHandler,
} from "./product-engine.controller";

const router = express.Router();

router.get("/:productId", getProductEngineViewHandler);
router.put("/:productId/seo", upsertProductSeoHandler);
router.put("/:productId/ai-meta", upsertProductAiMetaHandler);
router.post("/inventory/movement", createInventoryMovementHandler);

export default router;