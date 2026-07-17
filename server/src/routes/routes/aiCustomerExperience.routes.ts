import { Router, Request, Response } from "express";
import { aiCustomerExperienceService } from "../ai/customerExperience/service";
import type { AiCxContext, BudgetShoppingInput, CatalogProduct, GiftFinderInput, OccasionInput, SizeRecommendationInput } from "../ai/customerExperience/types";

const router = Router();

type Handler = (req: Request, res: Response) => Promise<void>;

function actorFromRequest(req: Request): AiCxContext["actor"] {
  const requestWithUser = req as Request & { user?: { id?: string; userId?: string; tenantId?: string; role?: string } };
  return {
    userId: requestWithUser.user?.id || requestWithUser.user?.userId,
    tenantId: requestWithUser.user?.tenantId || String(req.headers["x-tenant-id"] || "default"),
    role: requestWithUser.user?.role,
  };
}

function contextFromBody(req: Request): AiCxContext {
  const body = (req.body || {}) as { context?: AiCxContext; products?: CatalogProduct[]; cart?: CatalogProduct[]; wishlist?: CatalogProduct[] };
  return {
    ...(body.context || {}),
    actor: actorFromRequest(req),
    tenantId: actorFromRequest(req)?.tenantId,
    products: body.context?.products || body.products || [],
    cart: body.context?.cart || body.cart || [],
    wishlist: body.context?.wishlist || body.wishlist || [],
  };
}

function asyncHandler(handler: Handler): Handler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI customer experience request failed";
      res.status(500).json({ success: false, message });
    }
  };
}

router.post("/shopping-assistant", asyncHandler(async (req, res) => {
  const body = req.body as { message?: string };
  const result = await aiCustomerExperienceService.shoppingAssistant(body.message || "", contextFromBody(req));
  res.json({ success: true, data: result });
}));

router.post("/stylist", asyncHandler(async (req, res) => {
  const body = req.body as { query?: string };
  const result = await aiCustomerExperienceService.stylist(body.query || "", contextFromBody(req));
  res.json({ success: true, data: result });
}));

router.post("/outfit-builder", asyncHandler(async (req, res) => {
  const body = req.body as { selectedProduct?: CatalogProduct };
  if (!body.selectedProduct) {
    res.status(400).json({ success: false, message: "selectedProduct is required" });
    return;
  }
  const result = await aiCustomerExperienceService.outfitBuilder(body.selectedProduct, contextFromBody(req));
  res.json({ success: true, data: result });
}));

router.post("/size-recommendation", asyncHandler(async (req, res) => {
  const body = req.body as SizeRecommendationInput;
  const result = await aiCustomerExperienceService.sizeRecommendation(body, contextFromBody(req));
  res.json({ success: true, data: result });
}));

router.post("/budget-shopping", asyncHandler(async (req, res) => {
  const body = req.body as BudgetShoppingInput;
  if (!body.budget || body.budget <= 0) {
    res.status(400).json({ success: false, message: "budget must be greater than zero" });
    return;
  }
  const result = await aiCustomerExperienceService.budgetShopping(body, contextFromBody(req));
  res.json({ success: true, data: result });
}));

router.post("/gift-finder", asyncHandler(async (req, res) => {
  const body = req.body as GiftFinderInput;
  const result = await aiCustomerExperienceService.giftFinder(body, contextFromBody(req));
  res.json({ success: true, data: result });
}));

router.post("/occasion", asyncHandler(async (req, res) => {
  const body = req.body as OccasionInput;
  const result = await aiCustomerExperienceService.occasionRecommendation(body, contextFromBody(req));
  res.json({ success: true, data: result });
}));

router.post("/face-shape", asyncHandler(async (req, res) => {
  const body = req.body as { faceShape?: string };
  const result = await aiCustomerExperienceService.faceShapeRecommendation(body.faceShape || "", contextFromBody(req));
  res.json({ success: true, data: result });
}));

router.post("/skin-tone", asyncHandler(async (req, res) => {
  const body = req.body as { skinTone?: string };
  const result = await aiCustomerExperienceService.skinToneRecommendation(body.skinTone || "", contextFromBody(req));
  res.json({ success: true, data: result });
}));

export default router;