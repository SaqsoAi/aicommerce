import {
  LeadStage,
  SentimentLabel,
  SocialAnalyticsInput,
  SocialDraftRequest,
  SocialDraftResponse,
  SocialHandoffRequest,
  SocialIntent,
  SocialLeadApprovalRequest,
  SocialScheduleRequest,
  SpamRisk,
} from "./types";

type AnyRecord = Record<string, unknown>;

const KNOWLEDGE_SOURCE_KEYS: Array<keyof NonNullable<SocialDraftRequest["knowledge"]>> = [
  "products",
  "inventory",
  "orders",
  "deliveryPolicy",
  "returnPolicy",
  "faq",
  "membershipRules",
  "couponRules",
  "shippingRules",
  "cmsPages",
];

function compact(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function classifyIntent(message: string): SocialIntent {
  const m = message.toLowerCase();
  if (/(price|cost|koto|dam|tk|à§³)/i.test(m)) return "PRICE";
  if (/(stock|available|ase|in stock|out of stock)/i.test(m)) return "STOCK";
  if (/(delivery|shipping|courier|kobe pabo|home delivery)/i.test(m)) return "DELIVERY";
  if (/(size|fit|m size|l size|xl|xxl|measurement)/i.test(m)) return "SIZE";
  if (/(offer|discount|coupon|sale|promo)/i.test(m)) return "OFFER";
  if (/(order|tracking|track|invoice)/i.test(m)) return "ORDER_TRACKING";
  if (/(recommend|suggest|kon ta|which one)/i.test(m)) return "PRODUCT_RECOMMENDATION";
  if (/(complain|bad|problem|issue|refund|return|broken|late)/i.test(m)) return "COMPLAINT";
  if (/(agent|human|call|support)/i.test(m)) return "LIVE_AGENT_TRANSFER";
  if (/(faq|policy|rule)/i.test(m)) return "FAQ";
  return "SUPPORT";
}

function detectSentiment(message: string): SentimentLabel {
  const m = message.toLowerCase();
  if (/(spam|scam|adult|xxx|http:\/\/|https:\/\/|bit\.ly|free money)/i.test(m)) return "SPAM";
  if (/(abuse|stupid|fraud|cheat|angry|hate)/i.test(m)) return "ABUSE";
  if (/(bad|problem|late|wrong|refund|return|complain|poor)/i.test(m)) return "NEGATIVE";
  if (/(buy|order now|available\?|interested|need|price\?|want)/i.test(m)) return "SALES_OPPORTUNITY";
  if (/(good|nice|love|great|excellent|thanks|thank you)/i.test(m)) return "POSITIVE";
  return "NEUTRAL";
}

function detectSpam(message: string): SpamRisk {
  const m = message.toLowerCase();
  if (/(https?:\/\/|bit\.ly|tinyurl|t\.me\/)/i.test(m)) return "MALICIOUS_LINKS";
  if (/(adult|xxx|18\+|sex)/i.test(m)) return "ADULT";
  if (/(scam|free money|crypto guaranteed|loan approved)/i.test(m)) return "SCAM";
  if (/(abuse|hate|kill|stupid)/i.test(m)) return "ABUSE";
  if (/(buy followers|promotion service|bulk message)/i.test(m)) return "SPAM";
  return "NONE";
}

function detectLeadStage(intent: SocialIntent, sentiment: SentimentLabel, message: string): LeadStage | undefined {
  const m = message.toLowerCase();
  if (sentiment === "NEGATIVE" || intent === "COMPLAINT") return "COMPLAINT";
  if (/(vip|bulk|corporate|reseller|wholesale)/i.test(m)) return "VIP";
  if (/(confirm|order now|checkout|cod|ready|book)/i.test(m)) return "READY_TO_BUY";
  if (/(price|stock|size|delivery|info|details)/i.test(m)) return "NEED_INFO";
  if (sentiment === "SALES_OPPORTUNITY" || /(interested|want|need)/i.test(m)) return "INTERESTED";
  return undefined;
}

function knowledgeSources(request: SocialDraftRequest): string[] {
  const used: string[] = [];
  for (const key of KNOWLEDGE_SOURCE_KEYS) {
    const value = request.knowledge?.[key];
    if (Array.isArray(value) && value.length > 0) used.push(key);
    if (typeof value === "string" && value.trim().length > 0) used.push(key);
  }
  return used;
}

async function callAiGateway(prompt: string, metadata: AnyRecord): Promise<string | undefined> {
  const candidateModules = [
    "../gateway/service",
    "../gateway",
    "../core/gateway",
    "../aiGateway",
    "../../services/aiGateway.service",
  ];

  for (const modulePath of candidateModules) {
    try {
      const mod: AnyRecord = await import(modulePath);
      const gateway =
        mod.aiGateway ||
        mod.gateway ||
        mod.AiGateway ||
        mod.default ||
        mod.generateWithAiGateway ||
        mod.runAiGateway;

      if (typeof gateway === "function") {
        const result = await gateway({
          task: "AI_SOCIAL_MEDIA_MANAGER_DRAFT",
          prompt,
          metadata,
          approvalRequired: true,
          autoSend: false,
          autoReply: false,
          autoPublish: false,
        });
        if (typeof result === "string") return result;
        if (result && typeof result === "object") {
          const anyResult = result as AnyRecord;
          if (typeof anyResult.text === "string") return anyResult.text;
          if (typeof anyResult.content === "string") return anyResult.content;
          if (typeof anyResult.output === "string") return anyResult.output;
        }
      }

      if (gateway && typeof gateway === "object") {
        const runner = (gateway as AnyRecord).generate || (gateway as AnyRecord).run || (gateway as AnyRecord).complete;
        if (typeof runner === "function") {
          const result = await runner.call(gateway, {
            task: "AI_SOCIAL_MEDIA_MANAGER_DRAFT",
            prompt,
            metadata,
            approvalRequired: true,
            autoSend: false,
            autoReply: false,
            autoPublish: false,
          });
          if (typeof result === "string") return result;
          if (result && typeof result === "object") {
            const anyResult = result as AnyRecord;
            if (typeof anyResult.text === "string") return anyResult.text;
            if (typeof anyResult.content === "string") return anyResult.content;
            if (typeof anyResult.output === "string") return anyResult.output;
          }
        }
      }
    } catch {
      // Keep boundary-safe fallback. No direct provider call is allowed here.
    }
  }

  return undefined;
}

function fallbackDraft(request: SocialDraftRequest, intent: SocialIntent, sentiment: SentimentLabel): string {
  const prefix = request.language?.toLowerCase().startsWith("bn")
    ? "à¦§à¦¨à§à¦¯à¦¬à¦¾à¦¦à¥¤ "
    : "Thank you for reaching out. ";

  const byIntent: Record<SocialIntent, string> = {
    PRICE: "Please share the product name or code so our team can confirm the current approved price and any active offer.",
    STOCK: "Please share the product name, color, and size so our team can verify live stock before confirming.",
    DELIVERY: "Delivery time and charge depend on location. Please share your city/area so our team can confirm accurately.",
    SIZE: "Please share your preferred size or body measurement, and our team will suggest the best fit from the size chart.",
    OFFER: "Our team will check the currently approved campaign/coupon rules and confirm the eligible offer.",
    SUPPORT: "Our support team will review this and respond with the correct information.",
    COMPLAINT: "We are sorry for the issue. Please share order/invoice details so a staff member can review and escalate.",
    PRODUCT_RECOMMENDATION: "Please share your preferred category, size, color, and budget so our team can recommend suitable products.",
    ORDER_TRACKING: "Please share your order/invoice number so our team can check the latest order status.",
    COUPON_SUGGESTION: "Our team will verify approved coupon eligibility before suggesting a coupon.",
    FAQ: "Our team will verify the relevant policy/FAQ and reply with the accurate information.",
    LIVE_AGENT_TRANSFER: "A human agent can take over this conversation and assist you directly.",
  };

  const warning = sentiment === "SPAM" || sentiment === "ABUSE"
    ? " This message may need moderation review before any response."
    : "";

  return compact(`${prefix}${byIntent[intent]}${warning}`);
}

export async function generateSocialDraft(request: SocialDraftRequest): Promise<SocialDraftResponse> {
  const intent = classifyIntent(request.message);
  const sentiment = detectSentiment(request.message);
  const spamRisk = detectSpam(request.message);
  const leadStage = detectLeadStage(intent, sentiment, request.message);
  const sourcesUsed = knowledgeSources(request);

  const prompt = [
    "You are the Enterprise AI Social Media Manager for an ecommerce admin team.",
    "Generate a staff-review draft only. Never auto reply, auto DM, auto publish, or delete anything.",
    "Use only provided knowledge context when answering product/order/policy questions.",
    `Channel: ${request.channel}`,
    `Source: ${request.source}`,
    `Intent: ${intent}`,
    `Sentiment: ${sentiment}`,
    `Spam risk: ${spamRisk}`,
    `Knowledge sources: ${sourcesUsed.join(", ") || "none"}`,
    `Customer message: ${request.message}`,
  ].join("\n");

  const gatewayDraft = await callAiGateway(prompt, {
    tenantId: request.tenantId,
    staffId: request.staffId,
    campaignId: request.campaignId,
    productId: request.productId,
    orderId: request.orderId,
    channel: request.channel,
    source: request.source,
    intent,
    sentiment,
    spamRisk,
    knowledgeSourcesUsed: sourcesUsed,
    policy: "HUMAN_APPROVAL_REQUIRED",
  });

  const suggestedReply = compact(gatewayDraft || fallbackDraft(request, intent, sentiment));
  const moderationSuggestion =
    spamRisk === "NONE"
      ? undefined
      : `Suggest moderation review: ${spamRisk}. Do not delete automatically.`;

  return {
    channel: request.channel,
    source: request.source,
    intent,
    suggestedReply,
    confidence: gatewayDraft ? 0.78 : 0.55,
    sentiment,
    spamRisk,
    leadStage,
    moderationSuggestion,
    handoffRecommended: intent === "COMPLAINT" || intent === "LIVE_AGENT_TRANSFER" || sentiment === "NEGATIVE" || sentiment === "ABUSE",
    approvalRequired: true,
    autoReply: false,
    autoSend: false,
    autoPublish: false,
    knowledgeSourcesUsed: sourcesUsed,
    audit: {
      gatewayUsed: Boolean(gatewayDraft),
      providerRegistryBypassed: false,
      modelRegistryBypassed: false,
      promptRegistryBypassed: false,
      directProviderCall: false,
      policy: "HUMAN_APPROVAL_REQUIRED",
    },
  };
}

export async function approveSocialLead(request: SocialLeadApprovalRequest) {
  return {
    savedToCrm: request.crmApproved,
    autoSaved: false,
    channel: request.channel,
    leadStage: request.leadStage,
    sentiment: request.sentiment,
    note: request.crmApproved
      ? "Approved lead is ready for CRM owner integration. Existing CRM engine must persist it."
      : "Lead detected but not saved because staff approval is required.",
  };
}

export async function createHumanHandoff(request: SocialHandoffRequest) {
  return {
    channel: request.channel,
    status: request.agentId ? "ASSIGNED" : "OPEN",
    department: request.department,
    agentId: request.agentId,
    priority: request.priority || "NORMAL",
    autoAssigned: false,
    note: "Human handoff ticket prepared. Existing support/CRM workflow should own persistence.",
  };
}

export async function analyzeSocialPerformance(input: SocialAnalyticsInput) {
  const reach = Number(input.reach || 0);
  const engagement = Number(input.engagement || 0);
  const clicks = Number(input.clicks || 0);
  const ctr = reach > 0 ? Number(((clicks / reach) * 100).toFixed(2)) : 0;
  const engagementRate = reach > 0 ? Number(((engagement / reach) * 100).toFixed(2)) : 0;
  const followerGrowth = Number(input.followersAfter || 0) - Number(input.followersBefore || 0);

  return {
    channel: input.channel,
    campaignId: input.campaignId,
    reach,
    engagement,
    clicks,
    ctr,
    engagementRate,
    followerGrowth,
    bestPostCandidate: input.postTitle || null,
    bestTimeSignal: input.postedAt || null,
    bestChannelSignal: input.channel,
    campaignPerformance: engagementRate >= 5 || ctr >= 2 ? "STRONG" : engagementRate >= 2 ? "NORMAL" : "NEEDS_REVIEW",
    advisoryOnly: true,
  };
}

export async function prepareSocialSchedule(request: SocialScheduleRequest) {
  return {
    ...request,
    status: request.scheduledFor ? "SCHEDULED_DRAFT" : "QUEUED_FOR_APPROVAL",
    approvalRequired: true,
    autoPublish: false,
    publishingQueueOnly: true,
    note: "Prepared for publishing queue only. Existing campaign/marketing scheduler must own final publish approval.",
  };
}

export const aiSocialManagerService = {
  generateSocialDraft,
  approveSocialLead,
  createHumanHandoff,
  analyzeSocialPerformance,
  prepareSocialSchedule,
};