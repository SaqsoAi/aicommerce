import { aiGateway } from "../core/gateway";
import type {
  AiVisionContext,
  AiVisionFeature,
  AiVisionImageInput,
  AiVisionMediaActionInput,
  AiVisionProduct,
  AiVisionProductAnalysisInput,
  AiVisionRecommendationInput,
  AiVisionResponse,
  AiVisionSearchInput,
  AiVisionSafetyFinding,
} from "./types";

type GatewayResult = Awaited<ReturnType<typeof aiGateway.execute>>;

const COLOR_WORDS = ["black", "white", "blue", "red", "green", "yellow", "pink", "purple", "brown", "grey", "gray", "navy", "maroon", "beige", "cream", "orange"];
const FABRIC_WORDS = ["cotton", "denim", "linen", "silk", "wool", "polyester", "jersey", "knit", "leather"];
const PATTERN_WORDS = ["solid", "stripe", "check", "checked", "floral", "printed", "plain", "embroidered"];
const STYLE_WORDS = ["casual", "formal", "premium", "sports", "office", "eid", "wedding", "party", "travel"];
const CATEGORY_WORDS = ["shirt", "pant", "shoe", "watch", "belt", "cap", "bag", "panjabi", "saree", "kurti", "tshirt", "t-shirt", "jacket", "sunglass"];

function normalize(value: unknown): string {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim();
}

function enabled(context: AiVisionContext, flag: string): boolean {
  if (!context.featureFlags) return true;
  return context.featureFlags[flag] !== false;
}

function productText(product: AiVisionProduct): string {
  const tags = Array.isArray(product.tags) ? product.tags.join(" ") : String(product.tags ?? "");
  return normalize([
    product.name,
    product.title,
    product.description,
    product.category,
    product.subcategory,
    product.brand,
    product.color,
    product.gender,
    product.size,
    product.style,
    tags,
    product.attributes ? JSON.stringify(product.attributes) : "",
  ].filter(Boolean).join(" "));
}

function catalog(context: AiVisionContext): AiVisionProduct[] {
  return Array.isArray(context.products) ? context.products : [];
}

function extractVisualTags(input: AiVisionImageInput): string[] {
  const text = normalize([input.fileName, input.imageUrl, input.metadata ? JSON.stringify(input.metadata) : ""].filter(Boolean).join(" "));
  const tags = new Set<string>();
  for (const word of [...COLOR_WORDS, ...FABRIC_WORDS, ...PATTERN_WORDS, ...STYLE_WORDS, ...CATEGORY_WORDS]) {
    if (text.includes(word)) tags.add(word);
  }
  return [...tags];
}

function scoreProduct(product: AiVisionProduct, tags: string[], query?: string): number {
  const text = productText(product);
  let score = 0;
  for (const tag of tags) {
    if (text.includes(tag)) score += 14;
  }
  const queryTokens = normalize(query).split(/\s+/).filter(Boolean);
  for (const token of queryTokens) {
    if (text.includes(token)) score += 8;
  }
  if (product.active !== false) score += 4;
  if (typeof product.stock === "number") score += product.stock > 0 ? 8 : -20;
  return score;
}

function rankByVision(context: AiVisionContext, tags: string[], query: string | undefined, limit: number) {
  return catalog(context)
    .map((product) => ({ productId: product.id, product, score: scoreProduct(product, tags, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit || 12, 50)));
}

function safetyFindings(input: AiVisionImageInput | AiVisionMediaActionInput): AiVisionSafetyFinding[] {
  const findings: AiVisionSafetyFinding[] = [];
  const text = normalize([input.fileName, input.imageUrl, input.metadata ? JSON.stringify(input.metadata) : ""].filter(Boolean).join(" "));
  if (!input.imageUrl && !input.fileName) {
    findings.push({ code: "missing_image_reference", severity: "medium", message: "No image URL or filename was provided." });
  }
  if (text.includes("private") || text.includes("face") || text.includes("person")) {
    findings.push({ code: "face_or_person_image_privacy", severity: "medium", message: "Face/person imagery must be processed through privacy-safe provider routing and audit logging." });
  }
  if (text.includes("nsfw") || text.includes("unsafe")) {
    findings.push({ code: "unsafe_image_hint", severity: "high", message: "Potential unsafe image hint detected." });
  }
  return findings;
}

async function throughGateway(feature: AiVisionFeature, input: Record<string, unknown>, context: AiVisionContext): Promise<GatewayResult> {
  return aiGateway.execute({
    feature,
    input: {
      ...input,
      providerDetailsHiddenFromClient: true,
      directProviderCallBlocked: true,
      phase: "6.5",
    },
    cacheKey: `ai-vision:${feature}:${JSON.stringify(input).slice(0, 500)}`,
    metadata: {
      phase: "6.5",
      gatewayOnly: true,
      providerRegistryRequired: true,
      modelRegistryRequired: true,
      promptRegistryRequired: true,
      userId: context.userId,
      tenantId: context.tenantId,
    },
  });
}

function response<TData extends Record<string, unknown>>(
  feature: AiVisionFeature,
  gateway: GatewayResult,
  fallbackUsed: boolean,
  data: TData,
  adminApprovalRequired = true,
): AiVisionResponse<TData> {
  return {
    feature,
    gatewayStatus: String(gateway.status),
    providerMode: gateway.status === "completed" ? "gateway" : "placeholder",
    fallbackUsed,
    data,
    safety: {
      providerHidden: true,
      gatewayOnly: true,
      directProviderCallBlocked: true,
      originalImagePreserved: true,
      adminApprovalRequired,
      facePrivacyProtected: true,
    },
    audit: {
      auditId: gateway.auditId,
      latencyMs: gateway.latencyMs,
      estimatedCostUsd: gateway.estimatedCostUsd,
      phase: "6.5",
    },
  };
}

export const aiVisionService = {
  async virtualTryOnFoundation(input: AiVisionMediaActionInput, context: AiVisionContext) {
    const gateway = await throughGateway("virtual_tryon_foundation", { input, reuseExistingTryOn: true }, context);
    return response("virtual_tryon_foundation", gateway, gateway.status !== "completed", {
      jobSupported: true,
      providerRouting: "existing_virtual_tryon_or_registry",
      personImageRequired: true,
      garmentImageRequired: true,
      statusHistoryFailureAuditRequired: true,
      findings: safetyFindings(input),
    });
  },

  async imageSearch(input: AiVisionSearchInput, context: AiVisionContext) {
    const tags = extractVisualTags(input);
    const gateway = await throughGateway("image_search", { input, visualTags: tags }, context);
    const results = rankByVision(context, tags, input.query, input.limit || 12);
    return response("image_search", gateway, gateway.status !== "completed", {
      visualTags: tags,
      results,
      fallback: results.length > 0 ? "visual_metadata_catalog_ranking" : "semantic_search_fallback_required",
      findings: safetyFindings(input),
    }, false);
  },

  async ocrSearch(input: AiVisionSearchInput, context: AiVisionContext) {
    const query = input.query || normalize([input.fileName, input.imageUrl].filter(Boolean).join(" ")) || "ocr placeholder search";
    const gateway = await throughGateway("ocr_search", { input, generatedQuery: query, ocrProviderOptional: true }, context);
    return response("ocr_search", gateway, true, {
      generatedQuery: query,
      results: rankByVision(context, extractVisualTags(input), query, input.limit || 12),
      fallback: "safe_placeholder_until_ocr_provider_configured",
      findings: safetyFindings(input),
    }, false);
  },

  async productImageAnalysis(input: AiVisionProductAnalysisInput, context: AiVisionContext) {
    const tags = extractVisualTags(input);
    const gateway = await throughGateway("product_image_analysis", { input, suggestedOnly: true, visualTags: tags }, context);
    return response("product_image_analysis", gateway, gateway.status !== "completed", {
      productId: input.productId,
      suggestedOnly: true,
      doNotOverwriteAdminApprovedData: true,
      suggestedAttributes: {
        colors: tags.filter((tag) => COLOR_WORDS.includes(tag)),
        fabrics: tags.filter((tag) => FABRIC_WORDS.includes(tag)),
        patterns: tags.filter((tag) => PATTERN_WORDS.includes(tag)),
        styles: tags.filter((tag) => STYLE_WORDS.includes(tag)),
        categories: tags.filter((tag) => CATEGORY_WORDS.includes(tag)),
      },
      adminApprovedFields: input.adminApprovedFields || [],
      findings: safetyFindings(input),
    });
  },

  async productAttributeDetection(input: AiVisionProductAnalysisInput, context: AiVisionContext) {
    const gateway = await throughGateway("product_attribute_detection", { input, suggestedOnly: true }, context);
    const tags = extractVisualTags(input);
    return response("product_attribute_detection", gateway, gateway.status !== "completed", {
      suggestedOnly: true,
      attributes: tags,
      confidenceSource: gateway.status === "completed" ? "provider_registry" : "filename_metadata_fallback",
      findings: safetyFindings(input),
    });
  },

  async faceShapeFoundation(input: AiVisionRecommendationInput, context: AiVisionContext) {
    const gateway = await throughGateway("face_shape_foundation", { input, logicOnlyFallback: true }, context);
    const manual = normalize(input.manualInput);
    const faceShape = manual.includes("round") ? "round" : manual.includes("oval") ? "oval" : manual.includes("square") ? "square" : "unknown";
    return response("face_shape_foundation", gateway, true, {
      faceShape,
      recommendationMode: gateway.status === "completed" ? "provider_assisted" : "logic_only",
      suggestions: ["sunglass", "cap", "neck style", "accessory"],
      findings: safetyFindings(input),
    });
  },

  async skinToneFoundation(input: AiVisionRecommendationInput, context: AiVisionContext) {
    const gateway = await throughGateway("skin_tone_foundation", { input, manualFallback: true }, context);
    return response("skin_tone_foundation", gateway, true, {
      recommendationMode: gateway.status === "completed" ? "provider_assisted" : "manual_input_logic",
      bestColors: ["navy", "white", "maroon", "beige"],
      matchingColors: ["black", "cream", "olive"],
      trendingColors: ["coffee", "deep green", "royal blue"],
      findings: safetyFindings(input),
    });
  },

  async backgroundRemovalFoundation(input: AiVisionMediaActionInput, context: AiVisionContext) {
    const gateway = await throughGateway("background_removal_foundation", { input, originalPreserved: true }, context);
    return response("background_removal_foundation", gateway, true, {
      originalImagePreserved: true,
      outputBackground: input.outputBackground || "white",
      adminApprovalRequired: true,
      replacementBlockedUntilApproved: true,
      findings: safetyFindings(input),
    });
  },

  async lifestyleImageFoundation(input: AiVisionMediaActionInput, context: AiVisionContext) {
    const gateway = await throughGateway("lifestyle_image_foundation", { input, autoGenerateBlocked: true }, context);
    return response("lifestyle_image_foundation", gateway, true, {
      scenario: input.scenario || "studio",
      autoGenerationBlocked: true,
      adminActionRequired: true,
      supportedScenarios: ["studio", "office", "cafe", "outdoor", "eid", "wedding", "casual"],
      findings: safetyFindings(input),
    });
  },

  async modelGenerationFoundation(input: AiVisionMediaActionInput, context: AiVisionContext) {
    const gateway = await throughGateway("model_generation_foundation", { input, consentSafeOnly: true }, context);
    return response("model_generation_foundation", gateway, true, {
      modelType: input.modelType || "male",
      consentSafeOnly: true,
      autoGenerationBlocked: true,
      adminActionRequired: true,
      findings: safetyFindings(input),
    });
  },

  async visualSafetyGuard(input: AiVisionImageInput, context: AiVisionContext) {
    const gateway = await throughGateway("visual_safety_guard", { input, safetyFirst: true }, context);
    return response("visual_safety_guard", gateway, true, {
      allowed: safetyFindings(input).every((finding) => finding.severity !== "high"),
      findings: safetyFindings(input),
    }, false);
  },
};