import type { Request } from "express";

const HOST_PATTERN =
  /^(?=.{1,253}$)(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|\[[0-9a-f:]+\]|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)$/i;

export function normalizeHostname(value: unknown): string | null {
  const first = String(value || "").split(",")[0]?.trim().toLowerCase();
  if (!first) return null;

  let hostname = first;

  if (hostname.startsWith("[")) {
    const end = hostname.indexOf("]");
    if (end < 0) return null;
    hostname = hostname.slice(0, end + 1);
  } else {
    hostname = hostname.replace(/:\d+$/, "");
  }

  hostname = hostname.replace(/\.$/, "");
  return HOST_PATTERN.test(hostname) ? hostname : null;
}

export function trustedStorefrontHostname(req: Request): string | null {
  const internalToken = process.env.STOREFRONT_INTERNAL_TOKEN;
  const suppliedToken = String(req.headers["x-storefront-token"] || "");

  const suppliedHost = req.headers["x-storefront-host"];
  const allowUnsignedPublicHost =
    !internalToken &&
    process.env.ALLOW_UNSIGNED_STOREFRONT_HOST_HEADER !== "false";

  const internalHost =
    (internalToken && suppliedToken === internalToken) ||
    allowUnsignedPublicHost
      ? suppliedHost
      : undefined;

  const forwarded =
    process.env.TRUST_PROXY_HOST === "true"
      ? req.headers["x-forwarded-host"]
      : undefined;

  const original =
    process.env.TRUST_PROXY_HOST === "true"
      ? req.headers["x-original-host"]
      : undefined;

  return normalizeHostname(internalHost || original || forwarded || req.headers.host);
}
