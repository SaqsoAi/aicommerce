import fs from "fs/promises";
import path from "path";
import prisma from "../config/prisma";

type ProductMediaShape = {
  thumbnail?: string | null;
  gallery?: unknown;
  images?: Array<{ url?: string | null }>;
};

export type MediaCleanupResult = {
  requested: number;
  deleted: string[];
  preserved: Array<{ url: string; reason: string }>;
};

function normalizeUrl(value: unknown): string {
  return String(value || "").trim();
}

function collectJsonUrls(value: unknown, bucket: Set<string>): void {
  if (!value) return;
  if (typeof value === "string") {
    const clean = normalizeUrl(value);
    if (clean) bucket.add(clean);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonUrls(item, bucket));
    return;
  }
  if (typeof value === "object") {
    const row = value as Record<string, unknown>;
    if (row.url) collectJsonUrls(row.url, bucket);
    if (row.fileName) {
      bucket.add(`/uploads/products/${String(row.fileName).trim()}`);
    }
  }
}

export function collectProductMediaUrls(
  product: ProductMediaShape | null | undefined,
): string[] {
  const urls = new Set<string>();
  if (!product) return [];
  if (product.thumbnail) urls.add(normalizeUrl(product.thumbnail));
  collectJsonUrls(product.gallery, urls);
  for (const image of product.images || []) {
    if (image?.url) urls.add(normalizeUrl(image.url));
  }
  return [...urls].filter(Boolean);
}

function localProductFile(url: string): string | null {
  const clean = normalizeUrl(url);
  let pathname = clean;
  try {
    if (/^https?:\/\//i.test(clean)) pathname = new URL(clean).pathname;
  } catch {
    return null;
  }
  const marker = "/uploads/products/";
  const index = pathname.indexOf(marker);
  if (index < 0) return null;
  const relative = decodeURIComponent(pathname.slice(index + marker.length));
  if (!relative || relative.includes("\0")) return null;
  const root = path.resolve(process.cwd(), "uploads", "products");
  const candidate = path.resolve(root, relative);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    return null;
  }
  return candidate;
}

function galleryContainsUrl(value: unknown, url: string): boolean {
  const urls = new Set<string>();
  collectJsonUrls(value, urls);
  return urls.has(url);
}

export async function isProductMediaReferenced(url: string): Promise<boolean> {
  const clean = normalizeUrl(url);
  if (!clean) return false;

  const [thumbnailCount, imageCount, mediaCount, galleryRows] =
    await Promise.all([
      prisma.product.count({ where: { thumbnail: clean } }),
      prisma.productImage.count({ where: { url: clean } }),
      prisma.media.count({ where: { url: clean } }),
      prisma.product.findMany({

        select: { gallery: true },
      }),
    ]);

  return (
    thumbnailCount > 0 ||
    imageCount > 0 ||
    mediaCount > 0 ||
    galleryRows.some((row) => galleryContainsUrl(row.gallery, clean))
  );
}

export async function deleteProductMediaIfOrphaned(
  values: Iterable<string>,
): Promise<MediaCleanupResult> {
  const urls = [...new Set([...values].map(normalizeUrl).filter(Boolean))];
  const result: MediaCleanupResult = {
    requested: urls.length,
    deleted: [],
    preserved: [],
  };

  for (const url of urls) {
    const filePath = localProductFile(url);
    if (!filePath) {
      result.preserved.push({ url, reason: "NOT_LOCAL_PRODUCT_UPLOAD" });
      continue;
    }
    if (await isProductMediaReferenced(url)) {
      result.preserved.push({ url, reason: "STILL_REFERENCED" });
      continue;
    }
    try {
      await fs.unlink(filePath);
      result.deleted.push(url);
      console.info("[MediaLifecycle] deleted orphan product image", { url, filePath });
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        result.preserved.push({ url, reason: "FILE_ALREADY_ABSENT" });
      } else {
        result.preserved.push({ url, reason: `DELETE_FAILED:${error?.code || "UNKNOWN"}` });
        console.warn("[MediaLifecycle] product image delete failed", { url, filePath, error });
      }
    }
  }
  return result;
}

export async function cleanupRemovedProductMedia(
  before: ProductMediaShape | null | undefined,
  after: ProductMediaShape | null | undefined,
): Promise<MediaCleanupResult> {
  const previous = collectProductMediaUrls(before);
  const current = new Set(collectProductMediaUrls(after));
  return deleteProductMediaIfOrphaned(previous.filter((url) => !current.has(url)));
}
