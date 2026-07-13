import prisma from "../../config/prisma";
import type {
  ResolvedStorefrontContext,
  StorefrontResolution,
} from "./storefront-runtime.types";

function isActive(value: unknown): boolean {
  return String(value || "").toUpperCase() === "ACTIVE";
}

export async function resolveStorefrontContext(
  hostname: string | null,
  locale = "en",
): Promise<StorefrontResolution> {
  if (!hostname) {
    return {
      ok: false,
      reason: "UNKNOWN_DOMAIN",
      message: "The storefront domain is not configured.",
    };
  }

  try {
    const domain = await prisma.storefrontDomain.findUnique({
      where: { hostname },
      include: { tenant: true, store: true },
    });

    if (!domain) {
      return {
        ok: false,
        reason: "UNKNOWN_DOMAIN",
        message: "The storefront domain is not configured.",
      };
    }

    if (!isActive(domain.status)) {
      return {
        ok: false,
        reason: "DOMAIN_INACTIVE",
        message: "This storefront domain is currently unavailable.",
      };
    }

    if (domain.store.tenantId !== domain.tenantId) {
      return {
        ok: false,
        reason: "MISCONFIGURED_DOMAIN",
        message: "The storefront domain ownership is invalid.",
      };
    }

    if (!isActive(domain.tenant.status)) {
      return {
        ok: false,
        reason: "TENANT_INACTIVE",
        message: "This storefront is currently unavailable.",
      };
    }

    if (!isActive(domain.store.status)) {
      return {
        ok: false,
        reason: "STORE_INACTIVE",
        message: "This store is currently unavailable.",
      };
    }

    if (!domain.tenant.storefrontEnabled || !domain.store.storefrontEnabled) {
      return {
        ok: false,
        reason: "STOREFRONT_DISABLED",
        message: "This storefront is disabled.",
      };
    }

    return {
      ok: true,
      context: {
        hostname,
        domainId: domain.id,
        tenantId: domain.tenantId,
        storeId: domain.storeId,
        isPrimary: domain.isPrimary,
        locale,
      },
    };
  } catch {
    return {
      ok: false,
      reason: "INTERNAL_ERROR",
      message: "The storefront context could not be resolved.",
    };
  }
}

export async function readScopedStorefrontRuntime(
  context: ResolvedStorefrontContext,
) {
  const [sections, settings] = await Promise.all([
    prisma.homepageSection.findMany({
      where: {
        tenantId: context.tenantId,
        storeId: context.storeId,
        enabled: true,
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    prisma.storeSetting.findUnique({
      where: { singletonKey: `store:${context.storeId}` },
    }),
  ]);

  return {
    context,
    template: settings?.activeTemplate || "saqsobuild",
    settings: settings
      ? {
          storeName: settings.storeName,
          storeTagline: settings.storeTagline,
          logoUrl: settings.logoUrl,
          faviconUrl: settings.faviconUrl,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          activeTemplate: settings.activeTemplate,
        }
      : null,
    sections,
  };
}
