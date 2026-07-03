export type HeroDevice = "desktop" | "laptop" | "tablet" | "mobile";

export type HeroCropSettings = {
  x: number;
  y: number;
  zoom: number;
  overlay: number;
};

export type HeroCropMap = Record<HeroDevice, HeroCropSettings>;

export type HeroStudioPayload = {
  src?: string;
  desktopSrc?: string;
  laptopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  videoSrc?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  cropMode?: string;
  qualityMode?: string;
  aiScore?: number;
  cropJson?: HeroCropMap;
  safeZoneJson?: {
    enabled: boolean;
    textX: number;
    textY: number;
    recommended?: string;
  };
};

export const HERO_DEVICES: {
  id: HeroDevice;
  label: string;
  frame: string;
  size: string;
}[] = [
  { id: "desktop", label: "Desktop", frame: "aspect-[16/9] max-w-5xl", size: "3840 × 2160" },
  { id: "laptop", label: "Laptop", frame: "aspect-[16/10] max-w-4xl", size: "2560 × 1600" },
  { id: "tablet", label: "Tablet", frame: "aspect-[3/4] max-w-md", size: "1536 × 2048" },
  { id: "mobile", label: "Mobile", frame: "aspect-[9/16] max-w-xs", size: "1080 × 1920" },
];

export const DEFAULT_HERO_CROP: HeroCropMap = {
  desktop: { x: 50, y: 50, zoom: 100, overlay: 55 },
  laptop: { x: 50, y: 50, zoom: 100, overlay: 55 },
  tablet: { x: 50, y: 50, zoom: 112, overlay: 62 },
  mobile: { x: 50, y: 50, zoom: 125, overlay: 68 },
};