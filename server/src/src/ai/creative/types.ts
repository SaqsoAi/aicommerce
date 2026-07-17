export type CreativeAssetKind =
  | "product_image"
  | "lifestyle_image"
  | "fashion_model"
  | "banner"
  | "poster"
  | "story"
  | "thumbnail"
  | "video_foundation";

export type CreativeApprovalStatus = "draft" | "preview" | "review" | "approved" | "published" | "rejected";

export type CreativeScenario =
  | "white_background"
  | "transparent_background"
  | "luxury_studio"
  | "shadow"
  | "reflection"
  | "office"
  | "cafe"
  | "outdoor"
  | "luxury"
  | "eid"
  | "wedding"
  | "travel"
  | "gym"
  | "casual"
  | "flash_sale"
  | "membership"
  | "category_banner";

export interface CreativeStudioInput {
  kind: CreativeAssetKind;
  scenario?: CreativeScenario | string;
  productId?: string;
  sourceImageUrl?: string;
  title?: string;
  brandVoice?: string;
  promptIntent?: string;
  dimensions?: string;
  locale?: string;
  tenantId?: string;
  userId?: string;
}

export interface CreativePromptTemplate {
  key: string;
  version: string;
  kind: CreativeAssetKind;
  description: string;
  guardrails: string[];
}

export interface CreativeAssetProvenance {
  promptVersion: string;
  provider: string;
  model: string;
  generationTime: string;
  userId?: string;
  tenantId?: string;
  approvalStatus: CreativeApprovalStatus;
  sourceProductId?: string;
  costEstimateUsd: number;
}

export interface CreativeStudioResponse {
  kind: CreativeAssetKind;
  status: CreativeApprovalStatus;
  previewOnly: true;
  providerRoutedThroughGateway: true;
  mediaManagerReused: true;
  promptRegistryRequired: true;
  noAutoPublish: true;
  noOriginalOverwrite: true;
  template: CreativePromptTemplate;
  generatedPromptPlan: string[];
  storyboard?: string[];
  provenance: CreativeAssetProvenance;
  safety: {
    unsafeImageBlocked: boolean;
    promptInjectionChecked: boolean;
    providerKeyHidden: boolean;
    tenantIsolationRequired: boolean;
  };
}
