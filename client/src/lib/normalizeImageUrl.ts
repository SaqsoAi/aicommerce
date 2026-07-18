const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000";

export function normalizeImageUrl(value?: string | null) {
  if (!value) return "/placeholder-product.svg";

  const raw = String(value).trim().replaceAll("\\\\", "/");
  if (!raw) return "/placeholder-product.svg";

  if (/^(https?:|data:|blob:)/i.test(raw)) {
    return raw;
  }

  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  if (/^\/(uploads|media|storage|public\/uploads)\//i.test(normalized)) {
    return `${SERVER_URL.replace(/\/$/, "")}${normalized.replace(/^\/public/, "")}`;
  }

  return normalized;
}
