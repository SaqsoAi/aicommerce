export type AiVisionFeature =
  | "virtual_tryon_foundation"
  | "image_search"
  | "ocr_search"
  | "product_image_analysis"
  | "product_attribute_detection"
  | "face_shape_foundation"
  | "skin_tone_foundation"
  | "background_removal_foundation"
  | "lifestyle_image_foundation"
  | "model_generation_foundation"
  | "visual_safety_guard";

export type AiVisionProviderMode = "gateway" | "placeholder" | "existing_provider";

export interface AiVisionContext {
  userId?: string;
  tenantId?: string;
  role?: string;
  products?: AiVisionProduct[];
  product?: AiVisionProduct | null;
  featureFlags?: Record<string, boolean>;
  membershipTier?: string | null;
}

export interface AiVisionProduct {
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
  price?: number | string | null;
  salePrice?: number | string | null;
  stock?: number | null;
  active?: boolean | null;
  status?: string | null;
  tags?: string[] | string | null;
  attributes?: Record<string, unknown> | null;
}

export interface AiVisionImageInput {
  imageUrl?: string;
  fileName?: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

export interface AiVisionSearchInput extends AiVisionImageInput {
  query?: string;
  limit?: number;
}

export interface AiVisionProductAnalysisInput extends AiVisionImageInput {
  productId?: string;
  adminApprovedFields?: string[];
}

export interface AiVisionRecommendationInput extends AiVisionImageInput {
  manualInput?: string;
  category?: string;
  limit?: number;
}

export interface AiVisionMediaActionInput extends AiVisionImageInput {
  scenario?: "studio" | "office" | "cafe" | "outdoor" | "eid" | "wedding" | "casual";
  outputBackground?: "white" | "transparent";
  modelType?: "male" | "female" | "kids";
  approvalRequired?: boolean;
}

export interface AiVisionSafetyFinding {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface AiVisionResponse<TData extends Record<string, unknown> = Record<string, unknown>> {
  feature: AiVisionFeature;
  gatewayStatus: string;
  providerMode: AiVisionProviderMode;
  fallbackUsed: boolean;
  data: TData;
  safety: {
    providerHidden: true;
    gatewayOnly: true;
    directProviderCallBlocked: true;
    originalImagePreserved: true;
    adminApprovalRequired: boolean;
    facePrivacyProtected: boolean;
  };
  audit: {
    auditId?: string;
    latencyMs?: number;
    estimatedCostUsd?: number;
    phase: "6.5";
  };
}