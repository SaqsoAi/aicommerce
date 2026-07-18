export type SocialChannel =
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "messenger"
  | "tiktok"
  | "telegram"
  | "linkedin"
  | "x"
  | "youtube";

export type SocialIntent =
  | "PRICE"
  | "STOCK"
  | "DELIVERY"
  | "SIZE"
  | "OFFER"
  | "SUPPORT"
  | "COMPLAINT"
  | "PRODUCT_RECOMMENDATION"
  | "ORDER_TRACKING"
  | "COUPON_SUGGESTION"
  | "FAQ"
  | "LIVE_AGENT_TRANSFER";

export type LeadStage = "INTERESTED" | "NEED_INFO" | "READY_TO_BUY" | "COMPLAINT" | "VIP";
export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "SPAM" | "ABUSE" | "SALES_OPPORTUNITY";
export type SpamRisk = "NONE" | "SPAM" | "SCAM" | "ADULT" | "MALICIOUS_LINKS" | "ABUSE";
export type HandoffStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type PublishingStatus = "DRAFT" | "QUEUED_FOR_APPROVAL" | "APPROVED_TO_SCHEDULE" | "SCHEDULED_DRAFT" | "REJECTED";

export interface SocialKnowledgeContext {
  products?: unknown[];
  inventory?: unknown[];
  orders?: unknown[];
  deliveryPolicy?: string;
  returnPolicy?: string;
  faq?: unknown[];
  membershipRules?: unknown[];
  couponRules?: unknown[];
  shippingRules?: unknown[];
  cmsPages?: unknown[];
}

export interface SocialDraftRequest {
  channel: SocialChannel;
  source: "COMMENT" | "DM" | "POST" | "REVIEW";
  message: string;
  customerId?: string;
  orderId?: string;
  productId?: string;
  tenantId?: string;
  staffId?: string;
  campaignId?: string;
  knowledge?: SocialKnowledgeContext;
  language?: string;
}

export interface SocialDraftResponse {
  channel: SocialChannel;
  source: SocialDraftRequest["source"];
  intent: SocialIntent;
  suggestedReply: string;
  confidence: number;
  sentiment: SentimentLabel;
  spamRisk: SpamRisk;
  leadStage?: LeadStage;
  moderationSuggestion?: string;
  handoffRecommended: boolean;
  approvalRequired: true;
  autoReply: false;
  autoSend: false;
  autoPublish: false;
  knowledgeSourcesUsed: string[];
  audit: {
    gatewayUsed: boolean;
    providerRegistryBypassed: false;
    modelRegistryBypassed: false;
    promptRegistryBypassed: false;
    directProviderCall: false;
    policy: "HUMAN_APPROVAL_REQUIRED";
  };
}

export interface SocialLeadApprovalRequest {
  channel: SocialChannel;
  customerName?: string;
  customerHandle?: string;
  customerId?: string;
  message: string;
  leadStage: LeadStage;
  sentiment: SentimentLabel;
  staffId?: string;
  tenantId?: string;
  crmApproved: boolean;
}

export interface SocialHandoffRequest {
  channel: SocialChannel;
  message: string;
  department: "SALES" | "SUPPORT" | "DELIVERY" | "RETURNS" | "MANAGEMENT";
  agentId?: string;
  staffId?: string;
  tenantId?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface SocialAnalyticsInput {
  channel: SocialChannel;
  campaignId?: string;
  reach?: number;
  engagement?: number;
  clicks?: number;
  followersBefore?: number;
  followersAfter?: number;
  postTitle?: string;
  postedAt?: string;
}

export interface SocialScheduleRequest {
  channel: Exclude<SocialChannel, "whatsapp" | "messenger" | "youtube">;
  title: string;
  body: string;
  campaignId?: string;
  scheduledFor?: string;
  assetIds?: string[];
  tenantId?: string;
  staffId?: string;
}