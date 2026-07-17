export type AiSearchFeature =
  | "semantic_search"
  | "similar_product_search"
  | "image_search_foundation"
  | "ocr_search_foundation"
  | "voice_search_foundation";

export type SearchProduct = {
  id: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  color?: string | null;
  gender?: string | null;
  size?: string | null;
  style?: string | null;
  tags?: string[] | string | null;
  price?: number | string | null;
  salePrice?: number | string | null;
  stock?: number | null;
  active?: boolean | null;
  status?: string | null;
  rating?: number | null;
  popularity?: number | null;
  attributes?: Record<string, unknown> | null;
};

export type AiSearchContext = {
  userId?: string;
  tenantId?: string;
  products?: SearchProduct[];
  product?: SearchProduct | null;
  featureFlags?: Record<string, boolean>;
  membership?: unknown;
  personalization?: Record<string, unknown>;
};

export type SemanticSearchInput = {
  query: string;
  budget?: number;
  size?: string;
  gender?: string;
  brand?: string;
  limit?: number;
};

export type SimilarProductInput = {
  productId: string;
  limit?: number;
};

export type ImageSearchFoundationInput = {
  imageUrl?: string;
  fileName?: string;
  metadata?: Record<string, unknown>;
  limit?: number;
};

export type OcrSearchFoundationInput = {
  imageUrl?: string;
  extractedText?: string;
  providerTextPlaceholder?: string;
  limit?: number;
};

export type VoiceSearchFoundationInput = {
  audioUrl?: string;
  transcript?: string;
  providerTranscriptPlaceholder?: string;
  limit?: number;
};

export type SearchIntent = {
  rawQuery: string;
  normalizedQuery: string;
  tokens: string[];
  colors: string[];
  categories: string[];
  occasions: string[];
  gender?: string;
  size?: string;
  brand?: string;
  budget?: number;
};

export type AiSearchResult = {
  productId: string;
  name: string;
  score: number;
  reasons: string[];
  product: SearchProduct;
};

export type AiSearchResponse<TData extends Record<string, unknown> = Record<string, unknown>> = {
  feature: AiSearchFeature;
  gatewayStatus: string;
  query?: string;
  results: AiSearchResult[];
  fallbackUsed: boolean;
  data: TData;
  safety: {
    providerHidden: true;
    gatewayOnly: true;
    noVisionModel: boolean;
    noOcrProvider: boolean;
    noSpeechProvider: boolean;
  };
  audit: {
    auditId?: string;
    latencyMs?: number;
    estimatedCostUsd?: number;
  };
};
