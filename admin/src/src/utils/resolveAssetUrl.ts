const RAW_API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

const trimSlash = (value: string) => value.replace(/\/+$/, "");
const stripApi = (value: string) => value.replace(/\/api\/?$/, "");

export const getApiBaseUrl = () => {
  if (RAW_API) return trimSlash(RAW_API);
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
};

export const getAssetBaseUrl = () => {
  const api = getApiBaseUrl();
  return stripApi(api);
};

export function resolveAssetUrl(input?: string | null): string {
  if (!input) return "";
  const value = String(input).trim();
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const normalized = value.startsWith("/") ? value : `/${value}`;
  const assetBase = getAssetBaseUrl();
  const apiBase = getApiBaseUrl();

  if (
    normalized.startsWith("/uploads") ||
    normalized.startsWith("/storage") ||
    normalized.startsWith("/media")
  ) {
    return `${assetBase}${normalized}`;
  }

  if (normalized.startsWith("/api/asset/")) {
    return `${assetBase}${normalized}`;
  }

  if (normalized.startsWith("/asset/")) {
    return `${apiBase}${normalized}`;
  }

  return normalized;
}

const imageKeys = new Set([
  "image",
  "imageUrl",
  "image_url",
  "thumbnail",
  "thumbnailUrl",
  "thumbnail_url",
  "logo",
  "logoUrl",
  "logo_url",
  "src",
  "desktopSrc",
  "laptopSrc",
  "tabletSrc",
  "mobileSrc",
  "heroImage",
  "heroImageUrl",
  "banner",
  "bannerUrl",
  "cover",
  "coverUrl",
  "avatar",
  "photo",
  "gallery",
  "images",
  "media",
  "variantImage",
]);

export function normalizeAssetFields<T>(data: T): T {
  const walk = (value: any): any => {
    if (Array.isArray(value)) return value.map(walk);
    if (!value || typeof value !== "object") return value;

    const next: any = {};
    for (const [key, item] of Object.entries(value)) {
      if (typeof item === "string" && imageKeys.has(key)) {
        next[key] = resolveAssetUrl(item);
      } else {
        next[key] = walk(item);
      }
    }

    return next;
  };

  return walk(data);
}

export const assetPlaceholder = "/placeholder.png";