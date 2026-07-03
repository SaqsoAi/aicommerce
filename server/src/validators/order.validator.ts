import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),

  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1"),

  price: z.coerce
    .number()
    .min(0, "Price must be 0 or greater"),
});

export const orderCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),

  phone: z.string().min(1, "Customer phone is required"),

  address: z.string().min(1, "Customer address is required"),
});

export const orderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),

  paymentMethod: z.string().min(1, "Payment method is required"),

  rewardRuleId: z.string().optional(),

  customer: orderCustomerSchema,

  items: z
    .array(orderItemSchema)
    .min(1, "At least one order item is required"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

export type OrderCustomerInput = z.infer<typeof orderCustomerSchema>;

export type OrderInput = z.infer<typeof orderSchema>;
