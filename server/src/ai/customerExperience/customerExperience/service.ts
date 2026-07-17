import { aiGateway } from "../core";
import type {
  AiCustomerExperienceFeature,
  AiCxContext,
  AiCxResponse,
  AiCxRecommendation,
  BudgetShoppingInput,
  CatalogProduct,
  GiftFinderInput,
  OccasionInput,
  SizeRecommendationInput,
} from "./types";
import {
  categoriesForOccasion,
  colorAdviceForSkinTone,
  estimateSize,
  faceShapeAdvice,
  inStock,
  normalizeText,
  priceOf,
  toRecommendation,
  topProducts,
} from "./rules";

async function throughGateway<T>(feature: AiCustomerExperienceFeature, input: unknown, context: AiCxContext): Promise<{ status: string; auditId?: string; latencyMs?: number; estimatedCostUsd?: number; output?: T }> {
  const response = await aiGateway.execute<T>({
    feature: `ai_customer_experience.${feature}`,
    promptKey: "ai.core.default",
    input,
    actor: {
      userId: context.actor?.userId,
      tenantId: context.actor?.tenantId || context.tenantId,
      role: context.actor?.role,
    },
    variables: {
      input: JSON.stringify(input),
      feature,
    },
    cacheKey: `ai-cx:${feature}:${JSON.stringify(input).slice(0, 500)}`,
    metadata: {
      phase: "6.2",
      providerDetailsHiddenFromClient: true,
      noVision: true,
    },
  });

  return {
    status: response.status,
    auditId: response.auditId,
    latencyMs: response.latencyMs,
    estimatedCostUsd: response.estimatedCostUsd,
    output: response.output as T | undefined,
  };
}

function cxResponse<T>(feature: AiCustomerExperienceFeature, gateway: Awaited<ReturnType<typeof throughGateway<unknown>>>, message: string, recommendations: AiCxRecommendation[], data: T): AiCxResponse<T> {
  return {
    feature,
    gatewayStatus: gateway.status,
    message,
    recommendations,
    data,
    safety: {
      providerHidden: true,
      gatewayOnly: true,
      noVision: true,
    },
    audit: {
      auditId: gateway.auditId,
      latencyMs: gateway.latencyMs,
      estimatedCostUsd: gateway.estimatedCostUsd,
    },
  };
}

function products(context: AiCxContext): CatalogProduct[] {
  return Array.isArray(context.products) ? context.products : [];
}

export const aiCustomerExperienceService = {
  async shoppingAssistant(message: string, context: AiCxContext): Promise<AiCxResponse<{ intent: string; coupons: unknown[]; membership: unknown; order: unknown }>> {
    const terms = normalizeText(message).split(/\s+/).filter(Boolean);
    const recommendations = topProducts(products(context), terms, 8);
    const intent = terms.includes("order") || terms.includes("track") ? "order_tracking" : terms.includes("coupon") ? "coupon_suggestion" : terms.includes("size") ? "size_help" : terms.includes("checkout") ? "checkout_guidance" : "product_recommendation";
    const gateway = await throughGateway("shopping_assistant", { message, intent, terms, contextSummary: { cartCount: context.cart?.length || 0, wishlistCount: context.wishlist?.length || 0 } }, context);
    return cxResponse("shopping_assistant", gateway, "AI Shopping Assistant response generated through AI Gateway.", recommendations, {
      intent,
      coupons: (context.coupons || []).filter((coupon) => coupon.active !== false),
      membership: context.membership || null,
      order: context.order || null,
    });
  },

  async stylist(query: string, context: AiCxContext): Promise<AiCxResponse<{ categories: string[] }>> {
    const categories = categoriesForOccasion(query);
    const terms = [...normalizeText(query).split(/\s+/).filter(Boolean), ...categories];
    const recommendations = topProducts(products(context), terms, 10);
    const gateway = await throughGateway("stylist", { query, categories }, context);
    return cxResponse("stylist", gateway, "AI Stylist suggestions generated from product catalog through AI Gateway.", recommendations, { categories });
  },

  async outfitBuilder(selectedProduct: CatalogProduct, context: AiCxContext): Promise<AiCxResponse<{ baseProductId?: string; targetCategories: string[] }>> {
    const baseCategory = normalizeText(selectedProduct.category || selectedProduct.subcategory || selectedProduct.name);
    const targetCategories = baseCategory.includes("shirt") ? ["pant", "shoe", "watch", "belt", "accessory"] : baseCategory.includes("shoe") ? ["shirt", "pant", "belt"] : ["shirt", "pant", "shoe", "watch", "accessory"];
    const terms = [selectedProduct.color || "", selectedProduct.gender || "", ...targetCategories].filter(Boolean);
    const recommendations = topProducts(products(context).filter((item) => item.id !== selectedProduct.id), terms, 8);
    const gateway = await throughGateway("outfit_builder", { selectedProduct, targetCategories }, context);
    return cxResponse("outfit_builder", gateway, "AI Outfit Builder matched complementary catalog items through AI Gateway.", recommendations, { baseProductId: selectedProduct.id, targetCategories });
  },

  async sizeRecommendation(input: SizeRecommendationInput, context: AiCxContext): Promise<AiCxResponse<{ recommendedSize: string; confidence: number; reason: string; adminSizeChartRequired: true }>> {
    const result = estimateSize(input.heightCm, input.weightKg, input.bodyType);
    const gateway = await throughGateway("size_recommendation", { ...input, rule: "admin_size_chart_must_remain_authority" }, context);
    return cxResponse("size_recommendation", gateway, "AI Size Recommendation prepared without overriding admin size chart.", [], {
      recommendedSize: result.size,
      confidence: result.confidence,
      reason: result.reason,
      adminSizeChartRequired: true,
    });
  },

  async budgetShopping(input: BudgetShoppingInput, context: AiCxContext): Promise<AiCxResponse<{ budget: number; total: number; remaining: number }>> {
    const maxItems = input.maxItems || 4;
    const categorySet = new Set((input.categories || []).map(normalizeText));
    const selected: CatalogProduct[] = [];
    let total = 0;

    for (const product of products(context).filter(inStock).sort((a, b) => priceOf(b) - priceOf(a))) {
      if (categorySet.size > 0 && !categorySet.has(normalizeText(product.category))) continue;
      const price = priceOf(product);
      if (price <= 0 || total + price > input.budget) continue;
      selected.push(product);
      total += price;
      if (selected.length >= maxItems) break;
    }

    const recommendations = selected.map((product) => toRecommendation(product, "Fits customer budget and stock availability.", 0.74));
    const gateway = await throughGateway("budget_shopping", { input, selectedCount: selected.length, total }, context);
    return cxResponse("budget_shopping", gateway, "AI Budget Shopping selected in-stock catalog combinations through AI Gateway.", recommendations, { budget: input.budget, total, remaining: Math.max(0, input.budget - total) });
  },

  async giftFinder(input: GiftFinderInput, context: AiCxContext): Promise<AiCxResponse<{ occasion?: string; budget?: number }>> {
    const terms = [input.gender, input.occasion, ...(input.budget ? [String(input.budget)] : [])].filter(Boolean) as string[];
    let candidates = products(context).filter(inStock);
    if (input.budget) candidates = candidates.filter((product) => priceOf(product) <= input.budget!);
    const recommendations = topProducts(candidates, terms, 8);
    const gateway = await throughGateway("gift_finder", input, context);
    return cxResponse("gift_finder", gateway, "AI Gift Finder recommendations generated through AI Gateway.", recommendations, { occasion: input.occasion, budget: input.budget });
  },

  async occasionRecommendation(input: OccasionInput, context: AiCxContext): Promise<AiCxResponse<{ occasion: string; targetCategories: string[] }>> {
    const targetCategories = categoriesForOccasion(input.occasion);
    const terms = [input.occasion, input.gender, ...targetCategories].filter(Boolean) as string[];
    let candidates = products(context).filter(inStock);
    if (input.budget) candidates = candidates.filter((product) => priceOf(product) <= input.budget!);
    const recommendations = topProducts(candidates, terms, 10);
    const gateway = await throughGateway("occasion_recommendation", { input, targetCategories }, context);
    return cxResponse("occasion_recommendation", gateway, "AI Occasion Recommendation generated from catalog through AI Gateway.", recommendations, { occasion: input.occasion, targetCategories });
  },

  async faceShapeRecommendation(faceShape: string, context: AiCxContext): Promise<AiCxResponse<{ advice: string[] }>> {
    const advice = faceShapeAdvice(faceShape);
    const recommendations = topProducts(products(context), advice, 6);
    const gateway = await throughGateway("face_shape_recommendation", { faceShape, advice, noImageAnalysis: true }, context);
    return cxResponse("face_shape_recommendation", gateway, "Face shape recommendation prepared without computer vision.", recommendations, { advice });
  },

  async skinToneRecommendation(skinTone: string, context: AiCxContext): Promise<AiCxResponse<{ colors: string[] }>> {
    const colors = colorAdviceForSkinTone(skinTone);
    const recommendations = topProducts(products(context), colors, 6);
    const gateway = await throughGateway("skin_tone_recommendation", { skinTone, colors, noComputerVision: true }, context);
    return cxResponse("skin_tone_recommendation", gateway, "Skin tone color suggestion prepared without computer vision.", recommendations, { colors });
  },
};


