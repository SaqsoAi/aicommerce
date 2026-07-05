import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const productStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
]);

const productVisibilitySchema = z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]);

const productConditionSchema = z.enum(["NEW", "USED", "REFURBISHED", "OPEN_BOX"]);

const approvalStatusSchema = z.enum(["DRAFT", "REVIEW", "APPROVED", "REJECTED"]);

const productVariantSchema = z.object({
  color: optionalTrimmedString,
  size: optionalTrimmedString,
  fabric: optionalTrimmedString,
  occasion: optionalTrimmedString,
  costPrice: z.coerce.number().nonnegative().optional(),
  salesPrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  sku: optionalTrimmedString,
  barcode: optionalTrimmedString,
  price: z.coerce.number().nonnegative().optional(),
  availableStock: z.coerce.number().int().nonnegative().optional(),
  lowStockThreshold: z.coerce.number().int().nonnegative().optional(),
  reservedStock: z.coerce.number().int().nonnegative().optional(),
  supplierSku: optionalTrimmedString,
  warehouseLocation: optionalTrimmedString,
});

export const productSchema = z.object({
  name: z.string().trim().min(3),
  groupName: optionalTrimmedString,
  categoryId: z.string().trim().min(1),
  subcategoryId: optionalTrimmedString,
  brandId: optionalTrimmedString,
  sku: z.string().trim().min(3),
  styleNo: optionalTrimmedString,
  barcode: optionalTrimmedString,
  shortDescription: optionalTrimmedString,
  description: z.string().trim().min(3),
  seoTitle: optionalTrimmedString,
  seoKeywords: optionalTrimmedString,
  seoDescription: optionalTrimmedString,
  price: z.coerce.number().nonnegative(),
  discountPrice: z.coerce.number().nonnegative().optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  status: productStatusSchema.optional(),
  visibility: productVisibilitySchema.optional(),
  condition: productConditionSchema.optional(),
  approvalStatus: approvalStatusSchema.optional(),
  approvalNote: optionalTrimmedString,
  publishAt: optionalTrimmedString,
  unpublishAt: optionalTrimmedString,
  specifications: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        value: z.string().trim().min(1),
      })
    )
    .optional(),
  attributes: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        value: z.string().trim().min(1),
      })
    )
    .optional(),
  thumbnail: optionalTrimmedString,
  videoUrl: optionalTrimmedString,
  gallery: z
    .array(
      z.object({
        fileName: optionalTrimmedString,
        url: optionalTrimmedString,
        isThumbnail: z.boolean().optional(),
      })
    )
    .optional(),
  variants: z.array(productVariantSchema).optional(),
});

export const productUpdateSchema = productSchema.partial();
