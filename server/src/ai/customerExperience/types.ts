export type AiCustomerExperienceFeature =
  | "shopping_assistant"
  | "stylist"
  | "outfit_builder"
  | "size_recommendation"
  | "budget_shopping"
  | "gift_finder"
  | "occasion_recommendation"
  | "face_shape_recommendation"
  | "skin_tone_recommendation";

export interface AiCxActor {
  userId?: string;
  tenantId?: string;
  role?: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
  color?: string;
  size?: string;
  sizes?: string[];
  price?: number;
  stock?: number;
  tags?: string[];
  occasionTags?: string[];
  gender?: string;
  image?: string;
}

export interface AiCxContext {
  actor?: AiCxActor;
  tenantId?: string;
  locale?: string;
  currency?: string;
  products?: CatalogProduct[];
  cart?: CatalogProduct[];
  wishlist?: CatalogProduct[];
  membership?: {
    tier?: string;
    points?: number;
    nextTierAmount?: number;
  };
  order?: {
    id?: string;
    status?: string;
    trackingNumber?: string;
  };
  coupons?: Array<{
    code: string;
    description?: string;
    minAmount?: number;
    active?: boolean;
  }>;
}

export interface AiCxRecommendation {
  productId?: string;
  name: string;
  category?: string;
  reason: string;
  confidence: number;
  price?: number;
  stock?: number;
  metadata?: Record<string, unknown>;
}

export interface AiCxResponse<T = unknown> {
  feature: AiCustomerExperienceFeature;
  gatewayStatus: string;
  message: string;
  recommendations: AiCxRecommendation[];
  data: T;
  safety: {
    providerHidden: true;
    gatewayOnly: true;
    noVision: true;
  };
  audit?: {
    auditId?: string;
    latencyMs?: number;
    estimatedCostUsd?: number;
  };
}

export interface SizeRecommendationInput {
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: string;
  bodyType?: string;
  selectedProductId?: string;
  adminSizeChart?: Record<string, unknown>;
}

export interface GiftFinderInput {
  gender?: string;
  age?: number;
  budget?: number;
  occasion?: string;
}

export interface BudgetShoppingInput {
  budget: number;
  categories?: string[];
  maxItems?: number;
}

export interface OccasionInput {
  occasion: "office" | "wedding" | "eid" | "party" | "travel" | "gym" | "casual" | "festival" | string;
  gender?: string;
  budget?: number;
}