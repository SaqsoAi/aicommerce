import { z } from "zod";

export const createVirtualTryOnSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  personImage: z.string().url("personImage must be a valid URL"),
});
