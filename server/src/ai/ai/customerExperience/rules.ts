import type { CatalogProduct, AiCxRecommendation } from "./types";

export function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function inStock(product: CatalogProduct): boolean {
  return product.stock === undefined || product.stock > 0;
}

export function priceOf(product: CatalogProduct): number {
  return typeof product.price === "number" && Number.isFinite(product.price) ? product.price : 0;
}

export function scoreProduct(product: CatalogProduct, terms: string[]): number {
  const haystack = [
    product.name,
    product.category,
    product.subcategory,
    product.color,
    product.size,
    product.gender,
    ...(product.tags || []),
    ...(product.occasionTags || []),
  ].map(normalizeText).join(" ");

  let score = inStock(product) ? 0.2 : -0.5;
  for (const term of terms.map(normalizeText).filter(Boolean)) {
    if (haystack.includes(term)) score += 0.18;
  }
  if (priceOf(product) > 0) score += 0.05;
  return Math.max(0, Math.min(1, score));
}

export function toRecommendation(product: CatalogProduct, reason: string, confidence: number): AiCxRecommendation {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    reason,
    confidence: Math.max(0, Math.min(1, confidence)),
    price: product.price,
    stock: product.stock,
    metadata: {
      color: product.color,
      size: product.size,
      image: product.image,
    },
  };
}

export function topProducts(products: CatalogProduct[], terms: string[], limit = 6): AiCxRecommendation[] {
  return products
    .filter(inStock)
    .map((product) => ({ product, score: scoreProduct(product, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || priceOf(a.product) - priceOf(b.product))
    .slice(0, limit)
    .map((item) => toRecommendation(item.product, `Matched catalog terms: ${terms.filter(Boolean).join(", ") || "available product"}`, item.score));
}

export function categoriesForOccasion(occasion: string): string[] {
  const value = normalizeText(occasion);
  if (value.includes("wedding")) return ["shirt", "pant", "shoe", "watch", "belt", "accessory"];
  if (value.includes("office")) return ["shirt", "pant", "shoe", "belt", "watch"];
  if (value.includes("eid") || value.includes("festival")) return ["shirt", "pant", "shoe", "watch", "accessory"];
  if (value.includes("party")) return ["shirt", "pant", "shoe", "watch", "accessory"];
  if (value.includes("travel")) return ["t-shirt", "pant", "shoe", "bag", "cap"];
  if (value.includes("gym")) return ["t-shirt", "shorts", "shoe", "bag"];
  return ["shirt", "pant", "shoe", "watch", "accessory"];
}

export function estimateSize(heightCm?: number, weightKg?: number, bodyType?: string): { size: string; confidence: number; reason: string } {
  if (!heightCm || !weightKg) {
    return { size: "M", confidence: 0.35, reason: "Height and weight are incomplete. Showing conservative default and admin size chart must remain the authority." };
  }

  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  let size = "M";
  if (bmi < 18.5) size = heightCm > 175 ? "M" : "S";
  else if (bmi < 24) size = heightCm > 180 ? "L" : "M";
  else if (bmi < 29) size = heightCm > 178 ? "XL" : "L";
  else size = heightCm > 175 ? "XXL" : "XL";

  const body = normalizeText(bodyType);
  if (body.includes("broad") || body.includes("muscular")) {
    size = size === "S" ? "M" : size === "M" ? "L" : size === "L" ? "XL" : size;
  }

  return {
    size,
    confidence: 0.68,
    reason: "Recommendation uses height, weight, and body type only. It must not override the admin size chart.",
  };
}

export function colorAdviceForSkinTone(skinTone?: string): string[] {
  const tone = normalizeText(skinTone);
  if (tone.includes("warm")) return ["olive", "cream", "brown", "mustard", "deep red"];
  if (tone.includes("cool")) return ["navy", "charcoal", "white", "emerald", "blue"];
  if (tone.includes("deep") || tone.includes("dark")) return ["white", "cream", "royal blue", "burgundy", "olive"];
  if (tone.includes("fair")) return ["navy", "emerald", "maroon", "charcoal", "pastel blue"];
  return ["navy", "white", "charcoal", "olive", "burgundy"];
}

export function faceShapeAdvice(faceShape?: string): string[] {
  const shape = normalizeText(faceShape);
  if (shape.includes("round")) return ["structured cap", "angular sunglasses", "v-neck", "long chain accessory"];
  if (shape.includes("square")) return ["curved cap", "round sunglasses", "soft collar", "minimal accessory"];
  if (shape.includes("oval")) return ["classic cap", "aviator sunglasses", "crew or polo neck", "balanced accessory"];
  if (shape.includes("heart")) return ["low-profile cap", "light frame sunglasses", "open neck style", "subtle accessory"];
  return ["classic cap", "balanced sunglasses", "polo neck", "minimal accessory"];
}