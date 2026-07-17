export function getBackendOrigin() {
  const api =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000/api";

  return api.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

export function assetUrl(src?: string | null) {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  if (src.startsWith("/uploads/")) {
    return `${getBackendOrigin()}${src}`;
  }

  if (src.startsWith("uploads/")) {
    return `${getBackendOrigin()}/${src}`;
  }

  if (src.startsWith("/api/asset/")) {
    return `${getBackendOrigin()}${src.replace(/^\/api\/asset/, "/uploads")}`;
  }

  return src;
}
