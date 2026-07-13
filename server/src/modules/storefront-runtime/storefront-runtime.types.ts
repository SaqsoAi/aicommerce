export type StorefrontResolutionReason =
  | "UNKNOWN_DOMAIN"
  | "DOMAIN_INACTIVE"
  | "MISCONFIGURED_DOMAIN"
  | "TENANT_INACTIVE"
  | "STORE_INACTIVE"
  | "STOREFRONT_DISABLED"
  | "INTERNAL_ERROR";

export type ResolvedStorefrontContext = {
  hostname: string;
  domainId: string;
  tenantId: string;
  storeId: string;
  isPrimary: boolean;
  locale: string;
};

export type StorefrontResolution =
  | { ok: true; context: ResolvedStorefrontContext }
  | { ok: false; reason: StorefrontResolutionReason; message: string };
