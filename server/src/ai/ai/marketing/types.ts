export type MarketingChannel = "email" | "sms" | "whatsapp" | "push" | "coupon" | "journey" | "calendar";
export type MarketingApprovalStatus = "draft" | "pending_review" | "approved" | "rejected";
export type MarketingAudienceSegment = "new_customer" | "returning_customer" | "vip" | "abandoned_cart" | "post_purchase" | "inactive_customer" | "custom";

export interface AiMarketingContext {
  tenantId?: string;
  userId?: string;
  membershipTier?: string;
  rewardBalance?: number;
  cartValue?: number;
  purchaseHistory?: unknown[];
  customerSegment?: MarketingAudienceSegment | string;
  campaignEngineAvailable?: boolean;
  notificationEngineAvailable?: boolean;
  contentStudioAvailable?: boolean;
  creativeStudioAvailable?: boolean;
}

export interface AiMarketingGenerateInput {
  channel: MarketingChannel;
  goal: string;
  audience?: MarketingAudienceSegment | string;
  productIds?: string[];
  couponCode?: string;
  brandVoice?: string;
  tone?: string;
  language?: "en" | "bn" | "ar" | "hi";
  constraints?: string[];
}

export interface AiMarketingDraft {
  channel: MarketingChannel;
  subject?: string;
  previewText?: string;
  title?: string;
  body: string;
  cta?: string;
  deepLink?: string;
  couponSuggestion?: string;
  audience: string;
  approvalStatus: MarketingApprovalStatus;
  humanApprovalRequired: true;
  autoSendBlocked: true;
  autoPublishBlocked: true;
  safetyNotes: string[];
}

export interface AiMarketingResponse {
  feature: string;
  gatewayStatus: string;
  fallbackUsed: boolean;
  draft: AiMarketingDraft;
  audit: {
    auditId?: string;
    latencyMs?: number;
    estimatedCostUsd?: number;
  };
}