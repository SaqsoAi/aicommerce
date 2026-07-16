import { HOMEPAGE_SECTION_KEYS, type HomepageSectionInstance, type HomepageSectionKey, type HomepageSectionValidationResult } from "@/types/homepage-section";

const KEY_SET = new Set<string>(HOMEPAGE_SECTION_KEYS);

export const HOMEPAGE_SECTION_ALIASES: Readonly<Record<string, HomepageSectionKey | null>> = {
  HERO: null, HOMEPAGE_HERO: null, BANNER: null, SLIDER: null, PROMO_BANNER: null, ANNOUNCEMENT: null, TRUST_BADGES: null, CUSTOM_HTML: null,
  FEATURED_CATEGORIES: "FEATURED_CATEGORIES", CATEGORY_GRID: "FEATURED_CATEGORIES", CATEGORIES: "FEATURED_CATEGORIES",
  PRODUCT_RAIL: "PRODUCT_RAIL", FEATURED_PRODUCTS: "PRODUCT_RAIL", NEW_ARRIVALS: "PRODUCT_RAIL", BEST_SELLERS: "PRODUCT_RAIL", TRENDING: "PRODUCT_RAIL", TRENDING_PRODUCTS: "PRODUCT_RAIL", RECOMMENDATION_ENGINE: "PRODUCT_RAIL",
  CAMPAIGN: "CAMPAIGN", FLASH_SALE: "CAMPAIGN", DEALS: "CAMPAIGN",
  COLLECTION: "COLLECTION", COLLECTIONS: "COLLECTION", COLLECTION_GRID: "COLLECTION", LOOKBOOK: "COLLECTION", TRENDING_COLLECTIONS: "COLLECTION",
  SOCIAL_FEED: "SOCIAL_FEED", INSTAGRAM_FEED: "SOCIAL_FEED", FACEBOOK_FEED: "SOCIAL_FEED", UGC: "SOCIAL_FEED", SOCIAL_FEEDS: "SOCIAL_FEED",
  NEWSLETTER: "NEWSLETTER",
  MEMBERSHIP: "MEMBERSHIP", AI_MEMBERSHIP: "MEMBERSHIP", MEMBERSHIP_BANNER: "MEMBERSHIP", REWARDS: "MEMBERSHIP", AI_MEMBERSHIP_BANNER: "MEMBERSHIP",
};

export function normalizeHomepageSectionKey(rawKey: unknown): HomepageSectionKey | null {
  const normalized = String(rawKey ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (!normalized) return null;
  if (Object.prototype.hasOwnProperty.call(HOMEPAGE_SECTION_ALIASES, normalized)) return HOMEPAGE_SECTION_ALIASES[normalized] ?? null;
  return KEY_SET.has(normalized) ? normalized as HomepageSectionKey : null;
}

export function asRecord(input: unknown): Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input) ? input as Readonly<Record<string, unknown>> : {};
}

export function validateRecord(input: unknown): HomepageSectionValidationResult<Readonly<Record<string, unknown>>> {
  return typeof input === "object" && input !== null && !Array.isArray(input)
    ? { success: true, value: input as Readonly<Record<string, unknown>> }
    : { success: false, reason: "Expected an object." };
}

export function adaptHomepageSection(input: unknown, sourceIndex = 0): HomepageSectionInstance | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const row = input as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  const rawKey = String(row.type ?? row.key ?? "").trim();
  if (!id || !rawKey) return null;
  const config = asRecord(row.config);
  const data = asRecord(row.data);
  return {
    id, rawKey, key: normalizeHomepageSectionKey(rawKey),
    title: typeof row.title === "string" ? row.title : null,
    slug: typeof row.slug === "string" ? row.slug : null,
    enabled: row.enabled !== false,
    sortOrder: Number.isFinite(Number(row.sortOrder)) ? Number(row.sortOrder) : sourceIndex,
    config: Object.keys(config).length > 0 ? config : data,
    data,
  };
}

export function adaptHomepageSections(payload: unknown): HomepageSectionInstance[] {
  const rows = Array.isArray(payload) ? payload : typeof payload === "object" && payload !== null && Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: unknown[] }).data : [];
  return rows
    .map((row, index) => adaptHomepageSection(row, index))
    .filter((section): section is HomepageSectionInstance => section !== null && section.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

