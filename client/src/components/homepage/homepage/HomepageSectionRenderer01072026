"use client";

import SaqsoFeaturedCategories from "@/templates/saqsobuild/components/home/SaqsoFeaturedCategories";
import SaqsoFlashSale from "@/templates/saqsobuild/components/home/SaqsoFlashSale";
import SaqsoCollectionGrid from "@/templates/saqsobuild/components/home/SaqsoCollectionGrid";
import SaqsoSocialFeeds from "@/templates/saqsobuild/components/home/SaqsoSocialFeeds";
import SaqsoNewsletter from "@/templates/saqsobuild/components/home/SaqsoNewsletter";
import SaqsoAIMembershipBanner from "@/templates/saqsobuild/components/home/SaqsoAIMembershipBanner";

type Props = {
  sections: any[];
};

const normalizeType = (type?: string) =>
  String(type || "").toUpperCase();

export default function HomepageSectionRenderer({
  sections,
}: Props) {
  const visibleSections =
    (sections || [])
      .filter((section) => section.enabled)
      .sort(
        (a, b) =>
          Number(a.sortOrder || 0) -
          Number(b.sortOrder || 0)
      );

  return (
    <>
      {visibleSections.map((section) => {
        const type = normalizeType(section.type);

        if (
          type === "HERO" ||
          type === "HOMEPAGE_HERO" ||
          type === "BANNER" ||
          type === "SLIDER"
        ) {
          return null;
        }

        if (
          type === "HERO" ||
          type === "HOMEPAGE_HERO" ||
          type === "BANNER"
        ) {
          return null;
        }

        if (
          type === "FEATURED_CATEGORIES" ||
          type === "CATEGORY_GRID" ||
          type === "CATEGORIES"
        ) {
          return (
            <SaqsoFeaturedCategories
              key={section.id}
            />
          );
        }

        if (
          type === "FLASH_SALE" ||
          type === "DEALS" ||
          type === "CAMPAIGN"
        ) {
          return (
            <SaqsoFlashSale
              key={section.id}
            />
          );
        }

        if (
          type === "COLLECTIONS" ||
          type === "COLLECTION_GRID"
        ) {
          return (
            <SaqsoCollectionGrid
              key={section.id}
            />
          );
        }

        if (
          type === "SOCIAL_FEED" ||
          type === "INSTAGRAM_FEED" ||
          type === "FACEBOOK_FEED"
        ) {
          return (
            <SaqsoSocialFeeds
              key={section.id}
              settings={section.data || {}}
            />
          );
        }

        if (
          type === "NEWSLETTER"
        ) {
          return (
            <SaqsoNewsletter
              key={section.id}
            />
          );
        }

        if (
          type === "MEMBERSHIP" ||
          type === "AI_MEMBERSHIP"
        ) {
          return (
            <SaqsoAIMembershipBanner
              key={section.id}
            />
          );
        }

        return (
          <section
            key={section.id}
            className="mx-auto max-w-7xl px-6 py-12"
          >
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Homepage Section
              </p>

              <h2 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
                {section.title || section.type}
              </h2>

              <p className="mt-2 text-zinc-500">
                Renderer pending for type: {section.type}
              </p>
            </div>
          </section>
        );
      })}
    </>
  );
}





