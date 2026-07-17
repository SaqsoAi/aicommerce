import { Request, Response } from "express";
import {
  createInventoryMovement,
  getProductEngineView,
  upsertProductAiMeta,
  upsertProductSeo,
} from "./product-engine.service";

function getParam(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

export async function getProductEngineViewHandler(req: Request, res: Response) {
  try {
    const productId = getParam(req.params.productId);
    const data = await getProductEngineView(productId);

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to load product engine view",
    });
  }
}

export async function upsertProductSeoHandler(req: Request, res: Response) {
  try {
    const productId = getParam(req.params.productId);
    const data = await upsertProductSeo(productId, req.body || {});

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to save product SEO",
    });
  }
}

export async function upsertProductAiMetaHandler(req: Request, res: Response) {
  try {
    const productId = getParam(req.params.productId);
    const data = await upsertProductAiMeta(productId, req.body || {});

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to save product AI metadata",
    });
  }
}

export async function createInventoryMovementHandler(req: Request, res: Response) {
  try {
    const data = await createInventoryMovement(req.body || {});

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create inventory movement",
    });
  }
}