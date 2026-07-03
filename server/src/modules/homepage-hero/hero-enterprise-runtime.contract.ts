export type HeroDeviceKey = "desktop" | "laptop" | "tablet" | "mobile";

export type HeroWorkflowStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

export type HeroCropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HeroAiVisionResult = {
  compositionScore: number;
  qualityScore: number;
  safeZoneScore: number;
  readabilityScore: number;
  focusPoint: { x: number; y: number };
  faceBox?: HeroCropBox | null;
  subjectBox?: HeroCropBox | null;
  objectBox?: HeroCropBox | null;
  provider?: "LOCAL_FOUNDATION" | "AI_PROVIDER";
  updatedAt: string;
};

export type HeroRuntimeDraftPayload = {
  heroId: string;
  status: HeroWorkflowStatus;
  lockedVersion?: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  cropJson?: Partial<Record<HeroDeviceKey, HeroCropBox>>;
  aiVision?: HeroAiVisionResult;
  approvalNote?: string;
};

export type HeroAnalyticsPayload = {
  heroId: string;
  variantId?: string;
  device: HeroDeviceKey;
  event: "view" | "click" | "cta";
  crop?: HeroCropBox;
  createdAt?: string;
};

export type HeroVariantRuntime = {
  id: string;
  heroId: string;
  name: string;
  status: "ACTIVE" | "TESTING" | "WINNER" | "DISABLED";
  weight: number;
  views: number;
  clicks: number;
  ctr: number;
};

export const HERO_ENTERPRISE_RUNTIME_CONTRACT_VERSION = "SPRINT-1.7D.6";