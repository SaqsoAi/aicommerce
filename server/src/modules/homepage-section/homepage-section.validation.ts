import { z } from "zod";

export const homepageSectionSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  type: z.string().min(2),
  enabled: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
  data: z.unknown().optional(),
});
