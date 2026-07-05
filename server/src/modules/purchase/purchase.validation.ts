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
// PHASE 5.3 PURCHASE VALIDATION NOTE
// Required enterprise checks:
// - supplier exists
// - product exists
// - variant exists where required
// - warehouse exists where required
// - quantity > 0
// - costPrice >= 0
// - status workflow: DRAFT -> PENDING_APPROVAL -> APPROVED -> PARTIALLY_RECEIVED/RECEIVED -> terminal
// No duplicate procurement validator was created.
