import { aiGateway } from "../core/gateway";
import type {
  AiSearchContext,
  AiSearchFeature,
  AiSearchResponse,
  AiSearchResult,
  ImageSearchFoundationInput,
  OcrSearchFoundationInput,
  SearchIntent,
  SearchProduct,
  SemanticSearchInput,
  SimilarProductInput,
  VoiceSearchFoundationInput,
} from "./types";

type GatewayResult = Awaited<ReturnType<typeof aiGateway.execute>>;

const COLOR_WORDS = ["black", "white", "blue", "red", "green", "yellow", "pink", "purple", "brown", "grey", "gray", "navy", "maroon", "beige", "cream", "orange"];
const CATEGORY_WORDS = ["shirt", "pant", "shoe", "watch", "belt", "cap", "bag", "panjabi", "saree", "kurti", "tshirt", "t-shirt", "accessory", "sunglass", "jacket"];
const OCCASION_WORDS = ["office", "wedding", "eid", "party", "travel", "gym", "casual", "festival"];
const GENDER_WORDS = ["men", "male", "man", "women", "female", "woman", "kids", "boy", "girl"];
const SIZE_WORDS = ["xs", "s", "m", "l", "xl", "xxl", "3xl", "small", "medium", "large"];

function normalizeText(value: unknown): string {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim();
}

function parseTags(tags: SearchProduct["tags"]): string[] {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === "string") return tags.split(/[,|]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function priceOf(product: SearchProduct): number {
  const value = product.salePrice ?? product.price ?? 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isActive(product: SearchProduct): boolean {
  if (product.active === false) return false;
  if (product.status && ["inactive", "draft", "archived", "deleted"].includes(normalizeText(product.status))) return false;
  return true;
}

function inStock(product: SearchProduct): boolean {
  return typeof product.stock === "number" ? product.stock > 0 : true;
}

function productText(product: SearchProduct): string {
  return normalizeText([
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
    parseTags(product.tags).join(" "),
    product.attributes ? JSON.stringify(product.attributes) : "",
  ].filter(Boolean).join(" "));
}

function products(context: AiSearchContext): SearchProduct[] {
  return Array.isArray(context.products) ? context.products : [];
}

export function resolveSearchIntent(input: SemanticSearchInput): SearchIntent {
  const normalizedQuery = normalizeText(input.query);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const lowerBrand = normalizeText(input.brand);
  return {
    rawQuery: input.query,
    normalizedQuery,
    tokens,
    colors: tokens.filter((token) => COLOR_WORDS.includes(token)),
    categories: tokens.filter((token) => CATEGORY_WORDS.includes(token)),
    occasions: tokens.filter((token) => OCCASION_WORDS.includes(token)),
    gender: input.gender || tokens.find((token) => GENDER_WORDS.includes(token)),
    size: input.size || tokens.find((token) => SIZE_WORDS.includes(token)),
    brand: lowerBrand || undefined,
    budget: input.budget,
  };
}

function scoreProduct(product: SearchProduct, intent: SearchIntent, baseProduct?: SearchProduct): AiSearchResult {
  const text = productText(product);
  const reasons: string[] = [];
  let score = 0;

  for (const token of intent.tokens) {
    if (!token) continue;
    if (text.includes(token)) {
      score += 8;
      reasons.push(`Matched "${token}"`);
    }
  }

  for (const color of intent.colors) {
    if (normalizeText(product.color).includes(color)) {
      score += 15;
      reasons.push(`Color match: ${color}`);
    }
  }

  for (const category of intent.categories) {
    if (normalizeText(`${product.category ?? ""} ${product.subcategory ?? ""}`).includes(category)) {
      score += 18;
      reasons.push(`Category match: ${category}`);
    }
  }

  for (const occasion of intent.occasions) {
    if (text.includes(occasion)) {
      score += 12;
      reasons.push(`Occasion match: ${occasion}`);
    }
  }

  if (intent.gender && text.includes(normalizeText(intent.gender))) {
    score += 6;
    reasons.push(`Gender compatibility: ${intent.gender}`);
  }

  if (intent.size && text.includes(normalizeText(intent.size))) {
    score += 5;
    reasons.push(`Size compatibility: ${intent.size}`);
  }

  if (intent.brand && normalizeText(product.brand).includes(intent.brand)) {
    score += 10;
    reasons.push(`Brand match: ${intent.brand}`);
  }

  if (typeof intent.budget === "number" && intent.budget > 0) {
    const price = priceOf(product);
    if (price > 0 && price <= intent.budget) {
      score += 7;
      reasons.push("Within budget");
    } else if (price > intent.budget) {
      score -= 9;
      reasons.push("Above budget");
    }
  }

  if (baseProduct) {
    if (product.id === baseProduct.id) score -= 100;
    if (normalizeText(product.category) === normalizeText(baseProduct.category)) {
      score += 16;
      reasons.push("Similar category");
    }
    if (normalizeText(product.brand) && normalizeText(product.brand) === normalizeText(baseProduct.brand)) {
      score += 8;
      reasons.push("Similar brand");
    }
    if (normalizeText(product.color) && normalizeText(product.color) === normalizeText(baseProduct.color)) {
      score += 6;
      reasons.push("Similar color");
    }
    const price = priceOf(product);
    const basePrice = priceOf(baseProduct);
    if (price > 0 && basePrice > 0 && Math.abs(price - basePrice) / basePrice <= 0.25) {
      score += 5;
      reasons.push("Similar price range");
    }
  }

  if (isActive(product)) score += 4;
  if (inStock(product)) score += 10;
  else {
    score -= 20;
    reasons.push("Out of stock penalty");
  }

  if (typeof product.popularity === "number") score += Math.min(6, product.popularity / 20);
  if (typeof product.rating === "number") score += Math.min(6, product.rating);

  if (reasons.length === 0) reasons.push("Fallback catalog relevance");

  return {
    productId: product.id,
    name: String(product.name || product.title || product.id),
    score: Number(score.toFixed(2)),
    reasons: [...new Set(reasons)].slice(0, 8),
    product,
  };
}

function rankProducts(candidates: SearchProduct[], intent: SearchIntent, limit: number, baseProduct?: SearchProduct): AiSearchResult[] {
  return candidates
    .filter(isActive)
    .map((product) => scoreProduct(product, intent, baseProduct))
    .filter((item) => item.score > -50)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function throughGateway(feature: AiSearchFeature, input: Record<string, unknown>, context: AiSearchContext): Promise<GatewayResult> {
  return aiGateway.execute({
    feature,
    input: {
      ...input,
      providerDetailsHiddenFromClient: true,
      phase: "6.3",
    },
    cacheKey: `ai-search:${feature}:${JSON.stringify(input).slice(0, 500)}`,
    metadata: {
      phase: "6.3",
      gatewayOnly: true,
      searchFallbackPreserved: true,
    },
  });
}

function response<TData extends Record<string, unknown>>(
  feature: AiSearchFeature,
  gateway: GatewayResult,
  query: string | undefined,
  results: AiSearchResult[],
  fallbackUsed: boolean,
  data: TData,
  foundation: { noVisionModel?: boolean; noOcrProvider?: boolean; noSpeechProvider?: boolean } = {},
): AiSearchResponse<TData> {
  return {
    feature,
    gatewayStatus: gateway.status,
    query,
    results,
    fallbackUsed,
    data,
    safety: {
      providerHidden: true,
      gatewayOnly: true,
      noVisionModel: foundation.noVisionModel ?? true,
      noOcrProvider: foundation.noOcrProvider ?? true,
      noSpeechProvider: foundation.noSpeechProvider ?? true,
    },
    audit: {
      auditId: gateway.auditId,
      latencyMs: gateway.latencyMs,
      estimatedCostUsd: gateway.estimatedCostUsd,
    },
  };
}

export const aiSearchService = {
  async semanticSearch(input: SemanticSearchInput, context: AiSearchContext): Promise<AiSearchResponse<{ intent: SearchIntent; fallback: "keyword_catalog" | "ai_gateway" }>> {
    const intent = resolveSearchIntent(input);
    const limit = Math.max(1, Math.min(input.limit || 12, 50));
    const gateway = await throughGateway("semantic_search", { input, intent }, context);
    const ranked = rankProducts(products(context), intent, limit);
    return response("semantic_search", gateway, input.query, ranked, gateway.status !== "completed", { intent, fallback: gateway.status === "completed" ? "ai_gateway" : "keyword_catalog" });
  },

  async similarProductSearch(input: SimilarProductInput, context: AiSearchContext): Promise<AiSearchResponse<{ baseProductId: string; fallback: "catalog_similarity" }>> {
    const catalog = products(context);
    const base = context.product || catalog.find((item) => item.id === input.productId) || null;
    const query = base ? [base.name, base.title, base.category, base.brand, base.color, parseTags(base.tags).join(" ")].filter(Boolean).join(" ") : input.productId;
    const intent = resolveSearchIntent({ query, limit: input.limit });
    const gateway = await throughGateway("similar_product_search", { input, baseProductFound: Boolean(base) }, context);
    const ranked = rankProducts(catalog, intent, Math.max(1, Math.min(input.limit || 10, 50)), base || undefined);
    return response("similar_product_search", gateway, query, ranked, gateway.status !== "completed", { baseProductId: input.productId, fallback: "catalog_similarity" });
  },

  async imageSearchFoundation(input: ImageSearchFoundationInput, context: AiSearchContext): Promise<AiSearchResponse<{ flow: string; visionDeferredToPhase: "6.5" }>> {
    const extracted = normalizeText([input.fileName, input.imageUrl, input.metadata ? JSON.stringify(input.metadata) : ""].filter(Boolean).join(" "));
    const intent = resolveSearchIntent({ query: extracted || "image metadata search", limit: input.limit });
    const gateway = await throughGateway("image_search_foundation", { input, visionDeferredToPhase: "6.5" }, context);
    const ranked = rankProducts(products(context), intent, Math.max(1, Math.min(input.limit || 10, 50)));
    return response("image_search_foundation", gateway, intent.rawQuery, ranked, true, { flow: "upload_image_to_metadata_to_catalog_search", visionDeferredToPhase: "6.5" }, { noVisionModel: true });
  },

  async ocrSearchFoundation(input: OcrSearchFoundationInput, context: AiSearchContext): Promise<AiSearchResponse<{ flow: string; ocrProviderDeferredToPhase: "6.5" }>> {
    const query = input.extractedText || input.providerTextPlaceholder || input.imageUrl || "ocr placeholder search";
    const intent = resolveSearchIntent({ query, limit: input.limit });
    const gateway = await throughGateway("ocr_search_foundation", { input, ocrProviderDeferredToPhase: "6.5" }, context);
    const ranked = rankProducts(products(context), intent, Math.max(1, Math.min(input.limit || 10, 50)));
    return response("ocr_search_foundation", gateway, query, ranked, true, { flow: "image_to_text_placeholder_to_catalog_search", ocrProviderDeferredToPhase: "6.5" }, { noOcrProvider: true });
  },

  async voiceSearchFoundation(input: VoiceSearchFoundationInput, context: AiSearchContext): Promise<AiSearchResponse<{ flow: string; speechProviderDeferred: true }>> {
    const query = input.transcript || input.providerTranscriptPlaceholder || input.audioUrl || "voice placeholder search";
    const intent = resolveSearchIntent({ query, limit: input.limit });
    const gateway = await throughGateway("voice_search_foundation", { input, speechProviderDeferred: true }, context);
    const ranked = rankProducts(products(context), intent, Math.max(1, Math.min(input.limit || 10, 50)));
    return response("voice_search_foundation", gateway, query, ranked, true, { flow: "audio_to_transcript_placeholder_to_catalog_search", speechProviderDeferred: true }, { noSpeechProvider: true });
  },
};

