import type { ComponentType } from "react";
import RecommendationEngine from "@/templates/saqsobuild/components/RecommendationEngine";
import SaqsoFeaturedCategories from "@/templates/saqsobuild/components/home/SaqsoFeaturedCategories";
import SaqsoFlashSale from "@/templates/saqsobuild/components/home/SaqsoFlashSale";
import SaqsoCollectionGrid from "@/templates/saqsobuild/components/home/SaqsoCollectionGrid";
import SaqsoSocialFeeds from "@/templates/saqsobuild/components/home/SaqsoSocialFeeds";
import SaqsoNewsletter from "@/templates/saqsobuild/components/home/SaqsoNewsletter";
import SaqsoAIMembershipBanner from "@/templates/saqsobuild/components/home/SaqsoAIMembershipBanner";
import { validateRecord } from "@/lib/homepage-section-contract";
import type { HomepageSectionContract, HomepageSectionInstance, HomepageSectionKey } from "@/types/homepage-section";

type RegisteredRendererProps = { section: HomepageSectionInstance };
type RegisteredRenderer = ComponentType<RegisteredRendererProps>;
type Definition = HomepageSectionContract & { renderer: RegisteredRenderer | null };

const ProductRail: RegisteredRenderer = ({ section }) => <RecommendationEngine data={section.data} />;
const FeaturedCategories: RegisteredRenderer = ({ section }) => <SaqsoFeaturedCategories settings={section.data} />;
const Campaign: RegisteredRenderer = ({ section }) => <SaqsoFlashSale settings={section.data} />;
const Collection: RegisteredRenderer = ({ section }) => <SaqsoCollectionGrid settings={section.data} />;
const SocialFeed: RegisteredRenderer = ({ section }) => <SaqsoSocialFeeds settings={section.data} />;
const Newsletter: RegisteredRenderer = ({ section }) => <SaqsoNewsletter settings={section.data} />;
const Membership: RegisteredRenderer = () => <SaqsoAIMembershipBanner />;

function definition(key: HomepageSectionKey, label: string, category: string, aliases: readonly string[], renderer: RegisteredRenderer | null, runtimeDataMode: Definition["runtimeDataMode"]): Definition {
  return { key, label, category, aliases, renderer, runtimeDataMode, supportsPreview: true, supportsTenantScope: true, supportsStoreScope: true, validateConfig: validateRecord, validateData: validateRecord };
}

export const homepageSectionRegistry: Readonly<Record<HomepageSectionKey, Definition>> = {
  FEATURED_CATEGORIES: definition("FEATURED_CATEGORIES", "Featured Categories", "Catalog", ["CATEGORY_GRID", "CATEGORIES"], FeaturedCategories, "HYBRID"),
  PRODUCT_RAIL: definition("PRODUCT_RAIL", "Product Rail", "Catalog", ["FEATURED_PRODUCTS", "NEW_ARRIVALS", "BEST_SELLERS", "TRENDING", "RECOMMENDATION_ENGINE"], ProductRail, "API"),
  CAMPAIGN: definition("CAMPAIGN", "Campaign", "Marketing", ["FLASH_SALE", "DEALS"], Campaign, "HYBRID"),
  COLLECTION: definition("COLLECTION", "Collection", "Merchandising", ["COLLECTIONS", "COLLECTION_GRID", "LOOKBOOK"], Collection, "HYBRID"),
  SOCIAL_FEED: definition("SOCIAL_FEED", "Social Feed", "Engagement", ["INSTAGRAM_FEED", "FACEBOOK_FEED", "UGC"], SocialFeed, "HYBRID"),
  NEWSLETTER: definition("NEWSLETTER", "Newsletter", "Engagement", [], Newsletter, "STATIC"),
  MEMBERSHIP: definition("MEMBERSHIP", "Membership", "Loyalty", ["AI_MEMBERSHIP", "MEMBERSHIP_BANNER", "REWARDS"], Membership, "HYBRID"),
};

export function getHomepageSectionDefinition(key: HomepageSectionKey | null): Definition | null { return key ? homepageSectionRegistry[key] ?? null : null; }
export function isRenderableHomepageSection(section: HomepageSectionInstance): boolean { return Boolean(getHomepageSectionDefinition(section.key)?.renderer); }
export function hasRenderableHomepageSections(sections: readonly HomepageSectionInstance[] | undefined): boolean { return Boolean(sections?.some((section) => section.enabled && isRenderableHomepageSection(section))); }

