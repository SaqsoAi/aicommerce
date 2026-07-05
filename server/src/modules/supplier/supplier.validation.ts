import { z } from "zod";

export const supplierSchema =
  z.object({
    name: z.string().min(2),

    email:
      z.string()
        .email()
        .optional(),

    phone:
      z.string()
        .optional(),

    companyName:
      z.string()
        .optional(),

    address:
      z.string()
        .optional(),

    website:
      z.string()
        .optional(),

    contactPerson:
      z.string()
        .optional(),

    notes:
      z.string()
        .optional(),
  });
// PHASE 5.3 SUPPLIER VALIDATION NOTE
// Required enterprise checks:
// - active/inactive status compatibility
// - safe contact fields
// - purchase relation compatibility
// - ledger compatibility only if already present
// No full accounting ledger was created in Phase 5.3.
