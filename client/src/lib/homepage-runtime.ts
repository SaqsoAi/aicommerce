import "server-only";
import { adaptHomepageSections } from "@/lib/homepage-section-contract";
import type {
  HomepageRuntimeContext,
  HomepageRuntimeResult,
  HomepageTemplateKey,
} from "@/types/homepage-runtime";

const DEFAULT_TEMPLATE: HomepageTemplateKey = "saqsobuild";
const TEMPLATE_KEYS = new Set<HomepageTemplateKey>([
  "fashion",
  "luxury",
  "modern",
  "saqsobuild",
]);

function apiBase(): string {
  const configured =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    "http://localhost:5000/api";

  const clean = configured.replace(/\/$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

function normalizeTemplate(value: unknown): HomepageTemplateKey {
  const candidate = String(value || "")
    .trim()
    .toLowerCase() as HomepageTemplateKey;

  return TEMPLATE_KEYS.has(candidate) ? candidate : DEFAULT_TEMPLATE;
}

type RuntimeEnvelope = {
  success?: boolean;
  reason?: string;
  message?: string;
  data?: {
    context?: {
      hostname?: string;
      domainId?: string;
      tenantId?: string;
      storeId?: string;
      locale?: string;
    };
    template?: unknown;
    sections?: unknown;
  };
};

async function readScopedRuntime(
  context: HomepageRuntimeContext,
): Promise<{ status: number; payload: RuntimeEnvelope }> {
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    "X-Storefront-Host": context.hostname,
    "Accept-Language": context.locale,
  };

  if (process.env.STOREFRONT_INTERNAL_TOKEN) {
    requestHeaders["X-Storefront-Token"] =
      process.env.STOREFRONT_INTERNAL_TOKEN;
  }

  const response = await fetch(`${apiBase()}/storefront/runtime`, {
    cache: "no-store",
    headers: requestHeaders,
  });

  const payload = (await response
    .json()
    .catch(() => ({}))) as RuntimeEnvelope;

  return { status: response.status, payload };
}

export async function resolveHomepageRuntime(
  context: HomepageRuntimeContext,
): Promise<HomepageRuntimeResult> {
  if (context.mode === "preview") {
    return {
      context,
      template: DEFAULT_TEMPLATE,
      sections: [],
      state: "api-error",
      message:
        "Homepage preview is not available until the authorized revision service is implemented.",
    };
  }

  try {
    const { status, payload } = await readScopedRuntime(context);

    if (!payload.success || !payload.data) {
      const state =
        payload.reason === "UNKNOWN_DOMAIN"
          ? "unknown-domain"
          : payload.reason === "MISCONFIGURED_DOMAIN"
            ? "misconfigured"
            : status === 403
              ? "inactive"
              : "api-error";

      return {
        context,
        template: DEFAULT_TEMPLATE,
        sections: [],
        state,
        message: payload.message || "The homepage is unavailable.",
      };
    }

    const resolved = payload.data.context;

    const resolvedContext: HomepageRuntimeContext = {
      ...context,
      hostname: String(resolved?.hostname || context.hostname),
      locale: String(resolved?.locale || context.locale),
      domainId: String(resolved?.domainId || ""),
      tenantId: String(resolved?.tenantId || ""),
      storeId: String(resolved?.storeId || ""),
    };

    const sections = adaptHomepageSections(payload.data.sections);

    return {
      context: resolvedContext,
      template: normalizeTemplate(payload.data.template),
      sections,
      state: sections.length > 0 ? "ready" : "empty",
      message:
        sections.length > 0
          ? undefined
          : "No published homepage sections are configured for this store.",
    };
  } catch {
    return {
      context,
      template: DEFAULT_TEMPLATE,
      sections: [],
      state: "api-error",
      message: "The homepage is temporarily unavailable.",
    };
  }
}
