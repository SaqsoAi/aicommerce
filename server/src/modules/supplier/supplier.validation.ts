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