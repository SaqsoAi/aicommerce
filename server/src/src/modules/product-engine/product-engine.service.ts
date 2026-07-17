import prisma from "../../config/prisma";
import {
  InventoryMovementPayload,
  ProductEngineAiPayload,
  ProductEngineSeoPayload,
  assertProductId,
  normalizeStringArray,
} from "./product-engine.validation";

function nullable(value: string | undefined): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export async function getProductEngineView(productId: string) {
  const id = assertProductId(productId);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      variants: true,
      images: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const seo = await prisma.productSeo.findUnique({
    where: { productId: id },
  });

  const aiMeta = await prisma.productAiMeta.findUnique({
    where: { productId: id },
  });

  const movements = await prisma.inventoryMovement.findMany({
    where: { productId: id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const activeVariants = product.variants ?? [];

  const variantStock = activeVariants.reduce((sum: number, variant: any) => {
    const availableStock =
      typeof variant.availableStock === "number"
        ? variant.availableStock
        : typeof variant.stock === "number"
          ? variant.stock
          : 0;

    return sum + availableStock;
  }, 0);

  const stockStatus =
    variantStock <= 0 ? "OUT_OF_STOCK" : variantStock <= 5 ? "LOW_STOCK" : "IN_STOCK";

  const basePrice = Number((product as any).price ?? 0);
  const rawDiscountPrice = Number((product as any).discountPrice ?? 0);
  const discountPrice = rawDiscountPrice > 0 ? rawDiscountPrice : null;
  const finalPrice = discountPrice && discountPrice < basePrice ? discountPrice : basePrice;
  const discountAmount = Math.max(basePrice - finalPrice, 0);

  return {
    product,
    seo,
    aiMeta,
    movements,
    computed: {
      basePrice,
      finalPrice,
      discountAmount,
      stockStatus,
      variantStock,
      frontendRule: "RENDER_ONLY_NO_BUSINESS_LOGIC",
    },
  };
}

export async function upsertProductSeo(productId: string, payload: ProductEngineSeoPayload) {
  const id = assertProductId(productId);

  return prisma.productSeo.upsert({
    where: { productId: id },
    create: {
      productId: id,
      metaTitle: nullable(payload.metaTitle),
      metaDescription: nullable(payload.metaDescription),
      keywords: normalizeStringArray(payload.keywords),
      canonicalUrl: nullable(payload.canonicalUrl),
      ogTitle: nullable(payload.ogTitle),
      ogDescription: nullable(payload.ogDescription),
      ogImage: nullable(payload.ogImage),
    },
    update: {
      metaTitle: nullable(payload.metaTitle),
      metaDescription: nullable(payload.metaDescription),
      keywords: normalizeStringArray(payload.keywords),
      canonicalUrl: nullable(payload.canonicalUrl),
      ogTitle: nullable(payload.ogTitle),
      ogDescription: nullable(payload.ogDescription),
      ogImage: nullable(payload.ogImage),
    },
  });
}

export async function upsertProductAiMeta(productId: string, payload: ProductEngineAiPayload) {
  const id = assertProductId(productId);

  return prisma.productAiMeta.upsert({
    where: { productId: id },
    create: {
      productId: id,
      aiTitle: nullable(payload.aiTitle),
      aiDescription: nullable(payload.aiDescription),
      aiTags: normalizeStringArray(payload.aiTags),
      aiKeywords: normalizeStringArray(payload.aiKeywords),
      aiPersona: nullable(payload.aiPersona),
      aiSearchText: nullable(payload.aiSearchText),
      aiScore: typeof payload.aiScore === "number" ? payload.aiScore : 0,
      lastGeneratedAt: new Date(),
    },
    update: {
      aiTitle: nullable(payload.aiTitle),
      aiDescription: nullable(payload.aiDescription),
      aiTags: normalizeStringArray(payload.aiTags),
      aiKeywords: normalizeStringArray(payload.aiKeywords),
      aiPersona: nullable(payload.aiPersona),
      aiSearchText: nullable(payload.aiSearchText),
      aiScore: typeof payload.aiScore === "number" ? payload.aiScore : 0,
      lastGeneratedAt: new Date(),
    },
  });
}

export async function createInventoryMovement(payload: InventoryMovementPayload) {
  const id = assertProductId(payload.productId);

  if (!Number.isInteger(payload.quantity)) {
    throw new Error("quantity must be an integer");
  }

  if (!Number.isInteger(payload.previousStock) || !Number.isInteger(payload.newStock)) {
    throw new Error("previousStock and newStock must be integers");
  }

  return prisma.inventoryMovement.create({
    data: {
      productId: id,
      variantId: nullable(payload.variantId),
      type: payload.type,
      quantity: payload.quantity,
      previousStock: payload.previousStock,
      newStock: payload.newStock,
      reason: nullable(payload.reason),
      referenceType: nullable(payload.referenceType),
      referenceId: nullable(payload.referenceId),
      createdBy: nullable(payload.createdBy),
    },
  });
}