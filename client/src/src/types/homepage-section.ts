export const HOMEPAGE_SECTION_KEYS = [
  "FEATURED_CATEGORIES",
  "PRODUCT_RAIL",
  "CAMPAIGN",
  "COLLECTION",
  "SOCIAL_FEED",
  "NEWSLETTER",
  "MEMBERSHIP",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

export type HomepageSectionRuntimeMode = "STATIC" | "API" | "HYBRID";

export type HomepageSectionVisibility = {
  locale?: string[];
  device?: "ALL" | "DESKTOP" | "TABLET" | "MOBILE";
};

export type HomepageSectionMetadata = {
  tenantId?: string;
  storeId?: string;
  publicationId?: string;
  revisionId?: string;
};

export type HomepageSectionBaseConfig = {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  layout?: string;
  limit?: number;
};

export type HomepageSectionInstance = {
  id: string;
  rawKey: string;
  key: HomepageSectionKey | null;
  title?: string | null;
  slug?: string | null;
  enabled: boolean;
  sortOrder: number;
  config: Readonly<Record<string, unknown>>;
  data: Readonly<Record<string, unknown>>;
  visibility?: HomepageSectionVisibility;
  metadata?: HomepageSectionMetadata;
};

export type HomepageSectionValidationResult<T> =
  | { success: true; value: T }
  | { success: false; reason: string };

export type HomepageSectionContract<TConfig extends HomepageSectionBaseConfig = HomepageSectionBaseConfig, TData extends Readonly<Record<string, unknown>> = Readonly<Record<string, unknown>>> = {
  key: HomepageSectionKey;
  label: string;
  category: string;
  aliases: readonly string[];
  runtimeDataMode: HomepageSectionRuntimeMode;
  supportsPreview: boolean;
  supportsTenantScope: boolean;
  supportsStoreScope: boolean;
  validateConfig: (input: unknown) => HomepageSectionValidationResult<TConfig>;
  validateData: (input: unknown) => HomepageSectionValidationResult<TData>;
};
