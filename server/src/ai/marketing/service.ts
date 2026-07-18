import { aiGateway } from "../core/gateway";
import type { AiMarketingContext, AiMarketingDraft, AiMarketingGenerateInput, AiMarketingResponse } from "./types";

type GatewayResult = Awaited<ReturnType<typeof aiGateway.execute>>;

const SAFE_CHANNEL_LABEL: Record<string, string> = {
  email: "Email Marketing Draft",
  sms: "SMS Marketing Draft",
  whatsapp: "WhatsApp Marketing Draft",
  push: "Push Notification Draft",
  coupon: "Coupon Personalization Suggestion",
  journey: "Customer Journey Draft",
  calendar: "Marketing Calendar Draft",
};

function cleanText(value: unknown): string {
  return String(value ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

function limit(value: string, max: number): string {
  return value.length > max ? value.slice(0, max - 1).trimEnd() + "â€¦" : value;
}

function safeAudience(input: AiMarketingGenerateInput, context: AiMarketingContext): string {
  return cleanText(input.audience || context.customerSegment || "custom");
}

async function throughGateway(input: AiMarketingGenerateInput, context: AiMarketingContext): Promise<GatewayResult> {
  return aiGateway.execute({
    feature: "ai_marketing_automation",
    input: {
      channel: input.channel,
      goal: cleanText(input.goal),
      audience: safeAudience(input, context),
      productIds: input.productIds || [],
      brandVoice: input.brandVoice || "professional",
      tone: input.tone || "modern",
      language: input.language || "en",
      constraints: input.constraints || [],
      humanApprovalFirst: true,
      noAutoSend: true,
      noAutoPublish: true,
      phase: "6.9",
    },
    cacheKey: `ai-marketing:${input.channel}:${cleanText(input.goal).slice(0, 120)}:${safeAudience(input, context)}`,
    metadata: {
      phase: "6.9",
      gatewayOnly: true,
      humanApprovalFirst: true,
      noAutoSend: true,
      noAutoPublish: true,
      campaignEnginePreserved: true,
      notificationEnginePreserved: true,
      contentStudioReused: true,
      creativeStudioReused: true,
    },
  });
}

function fallbackDraft(input: AiMarketingGenerateInput, context: AiMarketingContext): AiMarketingDraft {
  const channel = input.channel;
  const goal = cleanText(input.goal || "campaign");
  const audience = safeAudience(input, context);
  const voice = cleanText(input.brandVoice || "professional");
  const tone = cleanText(input.tone || "modern");
  const label = SAFE_CHANNEL_LABEL[channel] || "Marketing Draft";

  const baseBody = `${label}: Create a ${tone} ${voice} campaign for ${audience}. Goal: ${goal}. This is a draft only and requires human approval before any customer-facing action.`;

  const draft: AiMarketingDraft = {
    channel,
    body: limit(baseBody, channel === "sms" ? 150 : 1200),
    cta: channel === "sms" ? undefined : "Review Offer",
    audience,
    approvalStatus: "draft",
    humanApprovalRequired: true,
    autoSendBlocked: true,
    autoPublishBlocked: true,
    safetyNotes: [
      "Human Approval First policy enforced.",
      "AI output is draft/suggestion only.",
      "No auto-send, no auto-publish, no pricing change.",
      "PII and consent must be checked before activation.",
    ],
  };

  if (channel === "email") {
    draft.subject = limit(`${voice} offer for ${audience}`, 70);
    draft.previewText = limit(`Personalized campaign draft for ${goal}`, 110);
  }
  if (channel === "push") {
    draft.title = limit(`New offer for you`, 45);
    draft.deepLink = "/shop";
  }
  if (channel === "coupon") {
    draft.couponSuggestion = input.couponCode || "Admin-approved coupon required";
  }
  if (channel === "whatsapp") {
    draft.cta = "View Catalog";
  }
  return draft;
}

export const aiMarketingAutomationService = {
  async generateDraft(input: AiMarketingGenerateInput, context: AiMarketingContext = {}): Promise<AiMarketingResponse> {
    const gateway = await throughGateway(input, context);
    const draft = fallbackDraft(input, context);
    return {
      feature: "ai_marketing_automation",
      gatewayStatus: String(gateway.status),
      fallbackUsed: gateway.status !== "completed",
      draft,
      audit: {
        auditId: gateway.auditId,
        latencyMs: gateway.latencyMs,
        estimatedCostUsd: gateway.estimatedCostUsd,
      },
    };
  },
};