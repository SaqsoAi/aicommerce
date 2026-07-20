import { z } from "zod";
export const homepageHeroSchema = z.object({
  type: z.enum(["image", "video"]).default("image"), src: z.string().min(1), alt: z.string().max(180).optional().default(""),
  headline: z.string().min(1).max(180), subheadline: z.string().max(420).optional().default(""),
  primaryCtaLabel: z.string().max(60).optional().default(""), primaryCtaLink: z.string().max(500).optional().default(""),
  secondaryCtaLabel: z.string().max(60).optional().default(""), secondaryCtaLink: z.string().max(500).optional().default(""),
  sliderEffect: z.enum(["fade", "slide", "zoom"]).default("fade"), cropMode: z.string().max(30).default("SYSTEM"),
  qualityMode: z.string().max(30).default("4K"), desktopSrc: z.string().optional().default(""), tabletSrc: z.string().optional().default(""), mobileSrc: z.string().optional().default(""),
  active: z.boolean().default(true), sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});
export const homepageHeroUpdateSchema = homepageHeroSchema.partial().refine(v => Object.keys(v).length > 0, "At least one field is required");
