export type AiSafePrimitive = string | number | boolean | null | undefined;

export type AiSafeValue =
  | AiSafePrimitive
  | AiSafeValue[]
  | { [key: string]: AiSafeValue };

export type AiMetadata = Record<string, AiSafeValue>;

export interface AiProductVectorInput {
  id: string;
  name: string;
  sku?: string | null;
  slug?: string | null;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  price?: number | null;
  salePrice?: number | null;
  tags?: string[];
  metadata?: AiMetadata;
}

export interface AiRecommendationProduct {
  id?: string;
  title?: string;
  name?: string;
  category?: string;
  brand?: string;
  price?: number;
  image?: string;
  tags?: string[];
  score?: number;
}

export interface AiRecommendationHistoryItem {
  productId?: string;
  title?: string;
  category?: string;
  brand?: string;
  score?: number;
}

export interface AiMemoryProfile {
  userId: string;
  savedLooks?: AiRecommendationProduct[];
  tryOns?: AiMetadata[];
  wishlist?: AiRecommendationProduct[];
  recommendationHistory?: AiRecommendationHistoryItem[];
}
