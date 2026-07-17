import { z } from "zod";

export const saveLookSchema = z.object({
  name: z.string().optional(),
  notes: z.string().optional(),
});
