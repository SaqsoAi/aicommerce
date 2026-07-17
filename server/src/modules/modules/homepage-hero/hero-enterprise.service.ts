import fs from "fs";
import path from "path";
import sharp from "sharp";

export type HeroDevice = "desktop" | "laptop" | "tablet" | "mobile";

export type EnterpriseHeroInput = {
  src?: string;
  headline?: string;
  subheadline?: string;
  altText?: string;
  brandVoice?: string;
  campaignType?: string;
  productFocus?: string;
};

export type EnterpriseHeroCopy = {
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  seoTitle: string;
  seoDescription: string;
  altText: string;
  imageFocus: "left" | "center" | "right";
  textSafeZone: "left" | "center" | "right";
  qualityScore: number;
  abTestKey: string;
};

const clean = (v?: string) => String(v || "").trim();

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export const generateEnterpriseHeroCopy = (
  input: EnterpriseHeroInput
): EnterpriseHeroCopy => {
  const campaign = clean(input.campaignType) || "Premium Fashion";
  const focus = clean(input.productFocus) || "New Collection";
  const voice = clean(input.brandVoice) || "SAQSO premium fashion";

  const headline =
    clean(input.headline) ||
    `${focus} Built for Modern Style`;

  const subheadline =
    clean(input.subheadline) ||
    `Discover ${campaign.toLowerCase()} essentials with a polished ${voice.toLowerCase()} experience.`;

  const primaryCtaLabel = "Shop Now";
  const secondaryCtaLabel = "Explore Collection";

  const seoTitle = `${headline} | AI Commerce Hero`;
  const seoDescription = subheadline.slice(0, 155);
  const altText =
    clean(input.altText) ||
    `${focus} hero banner for ${campaign}`;

  const textSafeZone =
    headline.length > 42 ? "left" : "center";

  const imageFocus =
    textSafeZone === "left" ? "right" : "center";

  const qualityScore = clamp(
    72 +
      (headline.length <= 58 ? 8 : -4) +
      (subheadline.length <= 150 ? 8 : -4) +
      (altText.length > 12 ? 6 : 0),
    0,
    100
  );

  return {
    headline,
    subheadline,
    primaryCtaLabel,
    secondaryCtaLabel,
    seoTitle,
    seoDescription,
    altText,
    imageFocus,
    textSafeZone,
    qualityScore,
    abTestKey: `hero-${Date.now()}`
  };
};

export const heroDeviceSizes: Record<HeroDevice, { width: number; height: number; suffix: string }> = {
  desktop: { width: 3840, height: 2160, suffix: "desktop-4k" },
  laptop: { width: 1920, height: 1080, suffix: "laptop" },
  tablet: { width: 1536, height: 1152, suffix: "tablet" },
  mobile: { width: 1080, height: 1440, suffix: "mobile" }
};

export const buildSmartCropMeta = (safeZone?: string, focus?: string) => ({
  cropMode: "SMART",
  imageFocus: focus || "center",
  textSafeZone: safeZone || "left",
  safeZoneOverlay: true,
  focusDetection: {
    mode: "sharp-attention",
    detected: true,
    focus: focus || "center"
  },
  objectDetection: {
    mode: "heuristic",
    detected: false,
    note: "Future-ready for face/object provider integration"
  }
});

export const renderHeroDeviceImages = async (
  sourcePath: string,
  uploadDir: string,
  publicBase: string,
  baseName: string
) => {
  fs.mkdirSync(uploadDir, { recursive: true });

  const result: Record<string, string> = {};

  for (const [device, cfg] of Object.entries(heroDeviceSizes)) {
    const filename = `${baseName}-${cfg.suffix}.webp`;
    const output = path.join(uploadDir, filename);

    await sharp(sourcePath)
      .rotate()
      .resize({
        width: cfg.width,
        height: cfg.height,
        fit: "cover",
        position: "attention",
        withoutEnlargement: false
      })
      .webp({ quality: device === "desktop" ? 92 : 88 })
      .toFile(output);

    result[`${device}Src`] = `${publicBase}/${filename}`;
  }

  return result as {
    desktopSrc: string;
    laptopSrc: string;
    tabletSrc: string;
    mobileSrc: string;
  };
};

const analyticsFile = path.join(process.cwd(), "data", "homepage-hero-analytics.json");

export const recordHeroAnalyticsEvent = (heroId: string, event: "view" | "click" | "publish") => {
  fs.mkdirSync(path.dirname(analyticsFile), { recursive: true });

  const current = fs.existsSync(analyticsFile)
    ? JSON.parse(fs.readFileSync(analyticsFile, "utf8"))
    : {};

  const row = current[heroId] || {
    heroId,
    views: 0,
    clicks: 0,
    publishes: 0,
    ctr: 0,
    updatedAt: null
  };

  if (event === "view") row.views += 1;
  if (event === "click") row.clicks += 1;
  if (event === "publish") row.publishes += 1;

  row.ctr = row.views > 0 ? Number(((row.clicks / row.views) * 100).toFixed(2)) : 0;
  row.updatedAt = new Date().toISOString();

  current[heroId] = row;
  fs.writeFileSync(analyticsFile, JSON.stringify(current, null, 2));

  return row;
};

export const getHeroAnalytics = (heroId?: string) => {
  if (!fs.existsSync(analyticsFile)) return heroId ? null : {};
  const data = JSON.parse(fs.readFileSync(analyticsFile, "utf8"));
  return heroId ? data[heroId] || null : data;
};
