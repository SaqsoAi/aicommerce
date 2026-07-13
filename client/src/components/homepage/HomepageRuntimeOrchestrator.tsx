import { headers } from "next/headers";

import TemplateRenderer from "@/builders/TemplateRenderer";
import HomepageRuntimeState from "@/components/homepage/HomepageRuntimeState";
import { resolveHomepageRuntime } from "@/lib/homepage-runtime";
import type { HomepageRuntimeContext } from "@/types/homepage-runtime";

function firstHeaderValue(value: string | null): string {
  return String(value || "").split(",")[0]?.trim() || "unknown";
}

export default async function HomepageRuntimeOrchestrator() {
  const requestHeaders = await headers();
  const hostname = firstHeaderValue(
    requestHeaders.get("x-forwarded-host") || requestHeaders.get("host"),
  ).toLowerCase();
  const locale = firstHeaderValue(requestHeaders.get("accept-language")).split(";")[0] || "en";

  const context: HomepageRuntimeContext = {
    hostname,
    pathname: "/",
    locale,
    mode: "published",
    tenantId: null,
    storeId: null,
    publicationId: null,
    revisionId: null,
  };

  const runtime = await resolveHomepageRuntime(context);

  if (runtime.state === "unknown-domain") {
    return (
      <HomepageRuntimeState
        title="Store not configured"
        message={
          runtime.message ||
          "This domain is not connected to a storefront."
        }
      />
    );
  }

  if (
    runtime.state === "inactive" ||
    runtime.state === "misconfigured"
  ) {
    return (
      <HomepageRuntimeState
        title="Store unavailable"
        message={
          runtime.message || "This storefront is currently unavailable."
        }
      />
    );
  }

  if (runtime.state === "api-error") {
    return (
      <HomepageRuntimeState
        title="Homepage unavailable"
        message={runtime.message || "The homepage could not be loaded."}
      />
    );
  }

  return (
    <TemplateRenderer
      template={runtime.template}
      sections={runtime.sections}
      emptyMessage={runtime.message}
    />
  );
}
