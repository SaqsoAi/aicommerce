import { z } from "zod";

export const lookbookItemProductSchema = z.object({
  productId: z.string().min(1),
});

export const lookbookItemSchema = z.object({
  image: z.string().min(1),
  title: z.string().optional(),
  caption: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  products: z.array(lookbookItemProductSchema).optional(),
});

export const createLookbookSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  items: z.array(lookbookItemSchema).optional(),
});

export const updateLookbookSchema = createLookbookSchema.partial();

export const publishLookbookSchema = z.object({
  published: z.boolean(),
});
