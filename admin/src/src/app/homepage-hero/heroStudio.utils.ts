import type { HeroCropMap, HeroStudioPayload } from "./heroStudio.types";

export function heroSafeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function calculateHeroAiScore(input: {
  headline: string;
  subheadline: string;
  hasAsset: boolean;
  overlay: number;
  textX: number;
}) {
  let value = 68;

  if (input.headline.length >= 18 && input.headline.length <= 72) value += 8;
  if (input.subheadline.length >= 40 && input.subheadline.length <= 180) value += 8;
  if (input.hasAsset) value += 8;
  if (input.overlay >= 40 && input.overlay <= 75) value += 5;
  if (input.textX >= 6 && input.textX <= 28) value += 3;

  return Math.min(value, 100);
}

export function buildHeroStudioPayload(input: {
  assetUrl: string;
  headline: string;
  subheadline: string;
  score: number;
  crop: HeroCropMap;
  safeZone: boolean;
  textX: number;
  textY: number;
}): HeroStudioPayload {
  return {
    src: input.assetUrl,
    desktopSrc: input.assetUrl,
    laptopSrc: input.assetUrl,
    tabletSrc: input.assetUrl,
    mobileSrc: input.assetUrl,
    headline: input.headline,
    subheadline: input.subheadline,
    primaryCtaLabel: "Shop Now",
    primaryCtaLink: "/shop",
    secondaryCtaLabel: "Try AI Fit",
    secondaryCtaLink: "/virtual-tryon",
    cropMode: "ADMIN_DEVICE_CROP",
    qualityMode: "4K",
    aiScore: input.score,
    cropJson: input.crop,
    safeZoneJson: {
      enabled: input.safeZone,
      textX: input.textX,
      textY: input.textY,
      recommended: "Keep subject outside left safe-zone text block on mobile/tablet.",
    },
  };
}