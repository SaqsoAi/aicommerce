import { z } from "zod";

export const purchaseSchema =
  z.object({
    supplierId:
      z.string().min(1),

    notes:
      z.string().optional(),

    items: z.array(
      z.object({
        productId:
          z.string(),

        quantity:
          z.coerce.number(),

        costPrice:
          z.coerce.number(),
      })
    ),
  });