"use client";

import HomepageSectionRenderer from "@/components/homepage/HomepageSectionRenderer";
import { hasRenderableHomepageSections } from "@/components/homepage/homepage-section-registry";
import type { HomepageRuntimeSection } from "@/types/homepage-runtime";

import RecommendationEngine from "./components/RecommendationEngine";
import StyleDiscovery from "./components/StyleDiscovery";
import TrendingCollections from "./components/TrendingCollections";
import { SaqsoAITrendPicksSection } from "./components/HomepagePremiumSections";
import SaqsoFooterPremium from "./components/SaqsoFooterPremium";

import SaqsoAiAssistant from "./components/ai/SaqsoAiAssistant";
import SaqsoOutfitRecommendation from "./components/ai/SaqsoOutfitRecommendation";
import SaqsoPersonalizedBanner from "./components/ai/SaqsoPersonalizedBanner";
import SaqsoVisualSearchBlock from "./components/ai/SaqsoVisualSearchBlock";
import SaqsoEnterpriseSections from "./components/enterprise/SaqsoEnterpriseSections";
import SaqsoAIMembershipBanner from "./components/home/SaqsoAIMembershipBanner";
import SaqsoCollectionGrid from "./components/home/SaqsoCollectionGrid";
import SaqsoFeaturedCategories from "./components/home/SaqsoFeaturedCategories";
import SaqsoFlashSale from "./components/home/SaqsoFlashSale";
import SaqsoHeroPro from "./components/home/SaqsoHeroPro";
import SaqsoMembershipBanner from "./components/home/SaqsoMembershipBanner";
import SaqsoNewsletter from "./components/home/SaqsoNewsletter";
import SaqsoSocialFeeds from "./components/home/SaqsoSocialFeeds";

type Props = {
  sections?: HomepageRuntimeSection[];
  emptyMessage?: string;
};

function CompleteHomepageFallback({ emptyMessage }: { emptyMessage?: string }) {
  return (
    <>
      <SaqsoAITrendPicksSection />
      <TrendingCollections />
      <SaqsoMembershipBanner />
      <SaqsoFeaturedCategories />
      <SaqsoCollectionGrid />
      <SaqsoPersonalizedBanner />
      <RecommendationEngine />
      <StyleDiscovery />
      <SaqsoOutfitRecommendation />
      <SaqsoVisualSearchBlock />
      <SaqsoFlashSale />
      <SaqsoAIMembershipBanner />
      <SaqsoEnterpriseSections />
      <SaqsoNewsletter />
      <SaqsoSocialFeeds
        settings={{
          enabled: true,
          title: "Follow Our Style",
          subtitle: "Real looks, daily inspiration, and social stories from SAQSO.",
          platforms: ["facebook", "instagram", "tiktok"],
          posts: [],
        }}
      />
      {emptyMessage ? <p className="sr-only">{emptyMessage}</p> : null}
    </>
  );
}

export default function SaqsoBuildHomeTemplate({ sections, emptyMessage }: Props) {
  const usePublishedSections = hasRenderableHomepageSections(sections);

  return (
    <div className="min-h-screen bg-white text-black antialiased dark:bg-black dark:text-white [--stylehub-header-h:48px] sm:[--stylehub-header-h:52px]">
      <main className="pt-0">
        <SaqsoHeroPro />
        {usePublishedSections ? (
          <HomepageSectionRenderer sections={sections ?? []} />
        ) : (
          <CompleteHomepageFallback emptyMessage={emptyMessage} />
        )}
      </main>
      <SaqsoAiAssistant />
      <SaqsoFooterPremium />
    </div>
  );
}

