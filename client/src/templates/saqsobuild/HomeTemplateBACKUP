"use client";

import SaqsoHeader from "./components/SaqsoHeader";

import SaqsoHeroPro from "./components/home/SaqsoHeroPro";
import SaqsoCollectionGrid from "./components/home/SaqsoCollectionGrid";
import SaqsoFeaturedCategories from "./components/home/SaqsoFeaturedCategories";
import SaqsoFlashSale from "./components/home/SaqsoFlashSale";
import SaqsoMembershipBanner from "./components/home/SaqsoMembershipBanner";
import SaqsoAIMembershipBanner from "./components/home/SaqsoAIMembershipBanner";
import SaqsoNewsletter from "./components/home/SaqsoNewsletter";
import SaqsoSocialFeeds from "./components/home/SaqsoSocialFeeds";

import SaqsoPersonalizedBanner from "./components/ai/SaqsoPersonalizedBanner";
import SaqsoOutfitRecommendation from "./components/ai/SaqsoOutfitRecommendation";
import SaqsoVisualSearchBlock from "./components/ai/SaqsoVisualSearchBlock";
import SaqsoAiAssistant from "./components/ai/SaqsoAiAssistant";

import RecommendationEngine from "./components/RecommendationEngine";
import StyleDiscovery from "./components/StyleDiscovery";
import TrendingCollections from "./components/TrendingCollections";
import { SaqsoAITrendPicksSection } from "./components/HomepagePremiumSections";

import SaqsoEnterpriseSections from "./components/enterprise/SaqsoEnterpriseSections";
import SaqsoFooterPremium from "./components/SaqsoFooterPremium";

export default function SaqsoBuildHomeTemplate() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <SaqsoHeader />

      <main>
        <SaqsoHeroPro />

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
            subtitle:
              "Real looks, daily inspiration, and social stories from SAQSO.",
            platforms: ["facebook", "instagram", "tiktok"],
            posts: [],
          }}
        />
      </main>

      <SaqsoAiAssistant />

      <SaqsoFooterPremium />
    </div>
  );
}
