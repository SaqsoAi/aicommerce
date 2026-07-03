import { z } from "zod";

export const sizeFitSettingsSchema = z.object({
  heroJson: z.any().optional(),
  statsJson: z.any().optional(),
  menuJson: z.any().optional(),
  sizeGuideJson: z.any().optional(),
  fitGuideJson: z.any().optional(),
  measurementJson: z.any().optional(),
  guaranteeJson: z.any().optional(),
  helpJson: z.any().optional(),
  ctaJson: z.any().optional(),
  reviewSettingsJson: z.any().optional(),
  layoutJson: z.any().optional(),
  active: z.boolean().optional(),
});

export const fitReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional().nullable(),
  productId: z.string().min(1),
  userId: z.string().min(1),
  fitRating: z.string().optional().nullable(),
  bodyType: z.string().optional().nullable(),
  heightCm: z.coerce.number().optional().nullable(),
  weightKg: z.coerce.number().optional().nullable(),
  sizeOrdered: z.string().optional().nullable(),
  reviewImages: z.any().optional().nullable(),
});

export const reviewActionSchema = z.object({
  value: z.boolean().optional(),
});
