import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3),

  groupName: z.string().optional(),

  categoryId: z.string().min(1),

  subcategoryId: z.string().optional(),

  brandId: z.string().optional(),

  sku: z.string().min(3),

  styleNo: z.string().optional(),

  barcode: z.string().optional(),

  shortDescription: z.string().optional(),

  description: z.string().min(3),

  seoTitle: z.string().optional(),

  seoKeywords: z.string().optional(),

  seoDescription: z.string().optional(),

  price: z.coerce.number(),

  discountPrice: z.coerce.number().optional(),

  featured: z.boolean().optional(),

  trending: z.boolean().optional(),

  status: z.string().optional(),

  visibility: z.string().optional(),

  condition: z.string().optional(),

  specifications: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),

  attributes: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),

  thumbnail: z.string().optional(),

  videoUrl: z.string().optional(),

  gallery: z
    .array(
      z.object({
        fileName: z.string().optional(),
        url: z.string().optional(),
        isThumbnail: z.boolean().optional(),
      })
    )
    .optional(),

  variants: z
    .array(
      z.object({
        color: z.string(),

        size: z.string(),

        fabric: z.string().optional(),

        occasion: z.string().optional(),

        costPrice: z.coerce.number().optional(),

        salesPrice: z.coerce.number().optional(),

        stock: z.coerce.number(),

        sku: z.string().optional(),

        barcode: z.string().optional(),

        price: z.coerce.number().optional(),

        availableStock: z.coerce.number().optional(),

        lowStockThreshold: z.coerce.number().optional(),

        reservedStock: z.coerce.number().optional(),

        supplierSku: z.string().optional(),

        warehouseLocation: z.string().optional(),
      })
    )
    .optional(),
});
