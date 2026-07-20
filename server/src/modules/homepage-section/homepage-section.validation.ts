import { z } from "zod";

export const homepageSectionTypeSchema = z.enum([
  "FEATURED_CATEGORIES", "PRODUCT_RAIL", "CAMPAIGN", "COLLECTION", "SOCIAL_FEED",
  "NEWSLETTER", "MEMBERSHIP", "PERSONALIZATION_BANNER", "STYLE_DISCOVERY",
  "SOCIAL_PROOF", "SUSTAINABILITY", "EDITORIAL_STORY", "TRUST_FEATURES",
]);

const sectionDataSchema = z.record(z.string(), z.unknown()).default({});

export const homepageSectionSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: homepageSectionTypeSchema,
  enabled: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  data: sectionDataSchema.optional(),
});

export const homepageSectionUpdateSchema = homepageSectionSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required",
);

export const homepageSectionReorderSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), sortOrder: z.coerce.number().int().min(0).max(999) })).min(1),
});

export const homepageSectionToggleSchema = z.object({ enabled: z.boolean() });
