export type ProductEngineSeoPayload = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
};

export type ProductEngineAiPayload = {
  aiTitle?: string;
  aiDescription?: string;
  aiTags?: string[];
  aiKeywords?: string[];
  aiPersona?: string;
  aiSearchText?: string;
  aiScore?: number;
};

export type InventoryMovementPayload = {
  productId: string;
  variantId?: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "RESERVED" | "RELEASED";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  createdBy?: string;
};

export function assertProductId(productId: unknown): string {
  if (typeof productId !== "string" || productId.trim().length < 3) {
    throw new Error("Valid productId is required");
  }

  return productId.trim();
}

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}