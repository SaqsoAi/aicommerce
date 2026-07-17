import { z } from "zod";

export const landingSectionSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(2),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  configJson: z.any().optional().nullable(),
});

export const landingCreateSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .transform((value) =>
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    ),
  campaignId: z.string().optional().nullable(),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  template: z.string().default("fashion"),
  sections: z.array(landingSectionSchema).default([]),
});

export const landingUpdateSchema = landingCreateSchema.partial();

export const landingPublishSchema = z.object({
  publishedBy: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});
