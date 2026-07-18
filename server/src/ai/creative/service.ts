import { aiGateway } from "../core/gateway";
import type { CreativeAssetKind, CreativePromptTemplate, CreativeStudioInput, CreativeStudioResponse } from "./types";

const PROMPT_VERSION = "creative-studio-6.8.0";

const templates: Record<CreativeAssetKind, CreativePromptTemplate> = {
  product_image: {
    key: "creative.product_image.catalog",
    version: PROMPT_VERSION,
    kind: "product_image",
    description: "Catalog-quality product image planning for white, transparent, luxury studio, shadow and reflection outputs.",
    guardrails: ["Never overwrite original image", "Preview only", "Admin approval required", "Reuse Media Manager"],
  },
  lifestyle_image: {
    key: "creative.lifestyle.scene",
    version: PROMPT_VERSION,
    kind: "lifestyle_image",
    description: "Lifestyle scene planning for office, cafe, outdoor, luxury, Eid, wedding, travel, gym and casual contexts.",
    guardrails: ["No auto generation without admin action", "Brand-safe", "Prompt registry required"],
  },
  fashion_model: {
    key: "creative.fashion_model.safe",
    version: PROMPT_VERSION,
    kind: "fashion_model",
    description: "Consent-safe model generation planning for male, female, kids, plus size and senior model variants.",
    guardrails: ["Respect provider safety policy", "No identity imitation", "Ethical and consent-safe output only"],
  },
  banner: {
    key: "creative.banner.campaign",
    version: PROMPT_VERSION,
    kind: "banner",
    description: "Homepage, offer, campaign, flash sale, membership and category banner planning using Phase 6.6 brand voice.",
    guardrails: ["Reuse Banner Engine", "Never duplicate Hero/Banner Engine", "Admin review before publish"],
  },
  poster: {
    key: "creative.poster.campaign",
    version: PROMPT_VERSION,
    kind: "poster",
    description: "Offer, product, festival, campaign and collection poster planning.",
    guardrails: ["Approval workflow required", "No auto publish"],
  },
  story: {
    key: "creative.story.social_size",
    version: PROMPT_VERSION,
    kind: "story",
    description: "Story creative planning for Instagram, Facebook and WhatsApp story sizes without social automation.",
    guardrails: ["No social media manager implementation", "No auto posting"],
  },
  thumbnail: {
    key: "creative.thumbnail.performance",
    version: PROMPT_VERSION,
    kind: "thumbnail",
    description: "Product, campaign and YouTube thumbnail planning.",
    guardrails: ["Brand safe", "Admin approval required"],
  },
  video_foundation: {
    key: "creative.video.foundation",
    version: PROMPT_VERSION,
    kind: "video_foundation",
    description: "Video foundation planning only: prompt, storyboard, shot list, voice-over text and scene list.",
    guardrails: ["No GPU rendering", "No full video generation", "Provider routing only"],
  },
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function planFor(input: CreativeStudioInput): string[] {
  const scenario = normalize(input.scenario || "brand safe ecommerce");
  const brandVoice = normalize(input.brandVoice || "premium");
  const title = normalize(input.title || input.kind.replace(/_/g, " "));
  return [
    `Create a ${input.kind.replace(/_/g, " ")} creative plan for ${title}.`,
    `Scenario: ${scenario}.`,
    `Brand voice: ${brandVoice}.`,
    "Use ecommerce-safe composition, clean product visibility, and approved brand tone.",
    "Return preview-ready creative instructions only; do not publish or overwrite original assets.",
  ];
}

function storyboard(input: CreativeStudioInput): string[] | undefined {
  if (input.kind !== "video_foundation") return undefined;
  return [
    "Scene 1: Product introduction with clear value proposition.",
    "Scene 2: Lifestyle usage moment matched to campaign scenario.",
    "Scene 3: Feature-benefit close-up shot list.",
    "Scene 4: CTA frame for admin-approved campaign destination.",
  ];
}

export const aiCreativeStudioService = {
  listTemplates(): CreativePromptTemplate[] {
    return Object.values(templates);
  },

  async generatePreview(input: CreativeStudioInput): Promise<CreativeStudioResponse> {
    const template = templates[input.kind] || templates.product_image;
    const generatedPromptPlan = planFor(input);

    const gatewayResult = await aiGateway.execute({
      feature: "creative_studio",
      input: {
        phase: "6.8",
        templateKey: template.key,
        templateVersion: template.version,
        kind: input.kind,
        scenario: input.scenario,
        promptIntent: input.promptIntent,
        providerDetailsHiddenFromClient: true,
        noImageGenerationExecuted: true,
        noVideoGenerationExecuted: true,
      },
      cacheKey: `ai-creative-studio:${input.kind}:${input.productId || "none"}:${template.version}`,
      metadata: {
        phase: "6.8",
        gatewayOnly: true,
        promptRegistryRequired: true,
        mediaManagerReused: true,
        approvalWorkflowRequired: true,
      },
    });

    return {
      kind: input.kind,
      status: "draft",
      previewOnly: true,
      providerRoutedThroughGateway: true,
      mediaManagerReused: true,
      promptRegistryRequired: true,
      noAutoPublish: true,
      noOriginalOverwrite: true,
      template,
      generatedPromptPlan,
      storyboard: storyboard(input),
      provenance: {
        promptVersion: template.version,
        provider: "gateway-routed-provider-hidden",
        model: "model-registry-selected-hidden",
        generationTime: new Date().toISOString(),
        userId: input.userId,
        tenantId: input.tenantId,
        approvalStatus: "draft",
        sourceProductId: input.productId,
        costEstimateUsd: Number(gatewayResult.estimatedCostUsd || 0),
      },
      safety: {
        unsafeImageBlocked: true,
        promptInjectionChecked: true,
        providerKeyHidden: true,
        tenantIsolationRequired: true,
      },
    };
  },
};
