export type AiContentBrandVoice = "luxury" | "fashion" | "corporate" | "minimal" | "friendly" | "technical" | "youth" | "premium";
export type AiContentTone = "luxury" | "professional" | "modern" | "elegant" | "minimal" | "fashion" | "sports";
export type AiContentLanguage = "en" | "bn" | "ar" | "hi";

export interface AiContentProductInput {
  productId?: string;
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  color?: string;
  material?: string;
  fabric?: string;
  pattern?: string;
  fit?: string;
  sleeve?: string;
  neck?: string;
  gender?: string;
  occasion?: string;
  collection?: string;
  price?: number;
  attributes?: Record<string, unknown>;
  existingDescription?: string;
}

export interface AiContentRequest {
  product: AiContentProductInput;
  brandVoice?: AiContentBrandVoice;
  tone?: AiContentTone;
  language?: AiContentLanguage;
  tenantId?: string;
  userId?: string;
  requestId?: string;
}

export interface AiExtractedFeatures {
  fabric?: string;
  material?: string;
  color?: string;
  pattern?: string;
  fit?: string;
  sleeve?: string;
  neck?: string;
  season?: string;
  occasion?: string;
  gender?: string;
  collection?: string;
}

export interface AiSeoContent {
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  slug: string;
  imageAltText: string;
  schemaSnippet: Record<string, unknown>;
  searchIntent: string;
}

export interface AiTagContent {
  searchTags: string[];
  fashionTags: string[];
  trendTags: string[];
  occasionTags: string[];
  materialTags: string[];
  colorTags: string[];
}

export interface AiContentDraft {
  status: "draft";
  approvalRequired: true;
  autoPublished: false;
  shortDescription: string;
  mediumDescription: string;
  longDescription: string;
  benefits: string[];
  extractedFeatures: AiExtractedFeatures;
  seo: AiSeoContent;
  tags: AiTagContent;
  categorySuggestion?: string;
  attributeSuggestions: AiExtractedFeatures;
  translation: {
    language: AiContentLanguage;
    note: string;
    content: string;
  };
  audit: {
    gatewayUsed: boolean;
    promptRegistryRequired: boolean;
    directProviderCall: false;
    promptInjectionGuard: true;
  };
}
