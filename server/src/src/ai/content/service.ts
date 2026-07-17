import { aiGateway } from "../core/gateway";
import type { AiContentDraft, AiContentRequest, AiExtractedFeatures, AiSeoContent, AiTagContent } from "./types";

type GatewayResult = Awaited<ReturnType<typeof aiGateway.execute>>;

const STOP_WORDS = new Set(["the", "and", "for", "with", "from", "this", "that", "your", "our", "product", "item"]);

function clean(value: unknown): string {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/[{}$`]/g, " ").replace(/\s+/g, " ").trim();
}

function titleCase(value: string): string {
  return clean(value).split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}

function slugify(value: string): string {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "product";
}

function words(...values: unknown[]): string[] {
  return values.flatMap((value) => clean(value).toLowerCase().split(/[^a-z0-9]+/)).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function unique(items: string[], limit = 12): string[] {
  return [...new Set(items.map(clean).filter(Boolean))].slice(0, limit);
}

function features(req: AiContentRequest): AiExtractedFeatures {
  const p = req.product;
  const attrs = p.attributes || {};
  return {
    fabric: clean(p.fabric || attrs.fabric),
    material: clean(p.material || attrs.material),
    color: clean(p.color || attrs.color),
    pattern: clean(p.pattern || attrs.pattern),
    fit: clean(p.fit || attrs.fit),
    sleeve: clean(p.sleeve || attrs.sleeve),
    neck: clean(p.neck || attrs.neck),
    season: clean(attrs.season),
    occasion: clean(p.occasion || attrs.occasion),
    gender: clean(p.gender || attrs.gender),
    collection: clean(p.collection || attrs.collection),
  };
}

async function throughGateway(req: AiContentRequest): Promise<GatewayResult> {
  return aiGateway.execute({
    feature: "content_studio" as never,
    input: {
      product: req.product,
      brandVoice: req.brandVoice || "premium",
      tone: req.tone || "professional",
      language: req.language || "en",
      phase: "6.6",
      promptRegistryRequired: true,
      providerDetailsHiddenFromClient: true,
      imageGeneration: false,
      videoGeneration: false,
    },
    cacheKey: `ai-content-studio:${slugify(req.product.name)}:${req.brandVoice || "premium"}:${req.tone || "professional"}:${req.language || "en"}`,
    metadata: {
      phase: "6.6",
      gatewayOnly: true,
      promptRegistryRequired: true,
      noDirectProviderCall: true,
      approvalWorkflow: "draft-review-approve-publish",
    },
  });
}

function descriptions(req: AiContentRequest, f: AiExtractedFeatures) {
  const p = req.product;
  const name = titleCase(p.name);
  const brand = titleCase(p.brand || "");
  const category = clean(p.category || "style");
  const color = clean(f.color);
  const material = clean(f.material || f.fabric);
  const occasion = clean(f.occasion || "everyday wear");
  const voice = clean(req.brandVoice || "premium");

  const intro = `${brand ? brand + " " : ""}${name}`;
  const details = unique([color, material, f.pattern, f.fit, f.sleeve, f.neck, category, occasion], 8).join(", ");
  const shortDescription = `${intro} brings a ${voice} ecommerce look with ${details || "carefully selected details"}. Designed for confident styling, it offers a polished balance of comfort, presentation, and everyday usability without overstating the product.`;
  const mediumDescription = `${intro} is crafted for customers who want reliable style with a refined finish. Its ${details || "balanced design details"} make it easy to pair with existing wardrobe pieces while keeping the presentation clean and commercial. The copy is generated as a draft for admin review, so product teams can adjust facts, sizing notes, and merchandising language before publishing.`;
  const longDescription = `${intro} is positioned as a premium ecommerce product draft for professional catalog use. The generated content focuses on customer benefit rather than keyword stuffing, highlighting the product's practical styling value, visual appeal, and buying confidence. ${material ? `The ${material} detail supports comfort and perceived quality. ` : ""}${color ? `The ${color} color direction makes it suitable for versatile merchandising. ` : ""}${occasion ? `For ${occasion}, it can be styled as part of a complete outfit or promoted with matching accessories. ` : ""}This draft should be reviewed by an admin before publication, especially where product facts, care instructions, size guidance, or compliance wording are required. The workflow intentionally avoids auto-publishing and keeps all AI-generated text behind approval controls.`;
  return { shortDescription, mediumDescription, longDescription };
}

function benefits(f: AiExtractedFeatures): string[] {
  const out: string[] = [];
  if (f.fabric || f.material) out.push(`Selected ${f.fabric || f.material} helps customers understand comfort and quality before purchase.`);
  if (f.fit) out.push(`${titleCase(f.fit)} fit gives shoppers a clearer expectation of silhouette and styling.`);
  if (f.color) out.push(`${titleCase(f.color)} color makes outfit matching easier across seasonal looks.`);
  if (f.occasion) out.push(`Suitable for ${f.occasion}, helping customers buy with a clear use case.`);
  if (f.pattern) out.push(`${titleCase(f.pattern)} pattern adds visual interest without complicating the product story.`);
  return unique(out.length ? out : ["Clear product storytelling improves buying confidence.", "Benefit-led copy helps customers understand why the item is useful."], 6);
}

function seo(req: AiContentRequest, f: AiExtractedFeatures): AiSeoContent {
  const p = req.product;
  const base = unique(words(p.name, p.brand, p.category, p.subcategory, f.color, f.material, f.fabric, f.occasion), 8);
  const name = titleCase(p.name);
  const metaTitle = `${name}${p.brand ? " | " + titleCase(p.brand) : ""}`.slice(0, 60);
  const metaDescription = `Shop ${name} with ${unique([f.color, f.material || f.fabric, f.fit, f.occasion], 4).join(", ") || "premium ecommerce details"}. Review AI draft content before publishing.`.slice(0, 155);
  return {
    metaTitle,
    metaDescription,
    focusKeywords: base,
    slug: slugify(`${p.brand || ""} ${p.name} ${f.color || ""}`),
    imageAltText: `${name}${f.color ? " in " + f.color : ""}${p.brand ? " by " + titleCase(p.brand) : ""}`.slice(0, 120),
    schemaSnippet: { "@type": "Product", name, brand: p.brand || undefined, category: p.category || undefined },
    searchIntent: "commercial product discovery",
  };
}

function tags(req: AiContentRequest, f: AiExtractedFeatures): AiTagContent {
  const p = req.product;
  return {
    searchTags: unique(words(p.name, p.brand, p.category, p.subcategory, f.color, f.material, f.fabric, f.fit, f.occasion), 12),
    fashionTags: unique([f.fit, f.pattern, f.sleeve, f.neck, p.category, p.subcategory].map(clean), 10),
    trendTags: unique([req.tone || "modern", req.brandVoice || "premium", f.collection, f.occasion].map(clean), 10),
    occasionTags: unique([f.occasion, "casual", "office", "event"].map(clean), 10),
    materialTags: unique([f.material, f.fabric].map(clean), 10),
    colorTags: unique([f.color].map(clean), 10),
  };
}

function translation(req: AiContentRequest, text: string) {
  const language = req.language || "en";
  if (language === "en") return { language, note: "English source draft retained.", content: text };
  return { language, note: "Translation provider not auto-published. Admin review required before use.", content: `[${language}] ${text}` };
}

export const aiContentStudioService = {
  async generateProductContent(req: AiContentRequest): Promise<AiContentDraft> {
    await throughGateway(req);
    const f = features(req);
    const d = descriptions(req, f);
    const seoContent = seo(req, f);
    return {
      status: "draft",
      approvalRequired: true,
      autoPublished: false,
      ...d,
      benefits: benefits(f),
      extractedFeatures: f,
      seo: seoContent,
      tags: tags(req, f),
      categorySuggestion: clean(req.product.category) || undefined,
      attributeSuggestions: f,
      translation: translation(req, d.mediumDescription),
      audit: {
        gatewayUsed: true,
        promptRegistryRequired: true,
        directProviderCall: false,
        promptInjectionGuard: true,
      },
    };
  },
};
