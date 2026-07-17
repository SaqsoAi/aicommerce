import type { Request, Response } from "express";
import aiPersonalizationService from "../services/aiPersonalization.service";

function safeInput(req: Request) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const user = (req as any).user || {};
  return {
    ...body,
    customerId: body.customerId || user.id || null,
    tenantId: body.tenantId || user.tenantId || null,
  };
}

export async function personalizedHomepage(req: Request, res: Response) {
  const result = aiPersonalizationService.personalizeHomepage(safeInput(req));
  res.json({ success: true, source: "ai-gateway-compatible-personalization", data: result });
}

export async function productRanking(req: Request, res: Response) {
  const input = safeInput(req);
  const products = Array.isArray((req.body as any)?.products) ? (req.body as any).products : [];
  const ranked = aiPersonalizationService.rankPersonalizedProducts(products, input);
  res.json({ success: true, source: "search-extension-personalization", data: ranked });
}

export async function wishlistPrediction(req: Request, res: Response) {
  const data = aiPersonalizationService.recommendWishlistAlternatives(safeInput(req));
  res.json({ success: true, source: "recommendation-extension-personalization", data });
}

export async function crossSell(req: Request, res: Response) {
  const data = aiPersonalizationService.recommendCrossSell(safeInput(req));
  res.json({ success: true, source: "commerce-recommendation-extension", data });
}

export async function upsell(req: Request, res: Response) {
  const data = aiPersonalizationService.recommendUpsell(safeInput(req));
  res.json({ success: true, source: "commerce-recommendation-extension", data });
}

export async function preferences(req: Request, res: Response) {
  const data = aiPersonalizationService.deriveCustomerPreferences(safeInput(req));
  res.json({ success: true, source: "customer-profile-preference-engine", data });
}
