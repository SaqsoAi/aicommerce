export type BrandRuntimeTracePayload = Record<string, unknown>;

declare global {
  interface Window {
    __brandTrace?: Array<{
      time: string;
      scope: string;
      event: string;
      payload?: BrandRuntimeTracePayload;
    }>;
    __exportBrandTrace?: () => string;
    __clearBrandTrace?: () => void;
  }
}

const TRACE_KEY = "ai-commerce-brand-runtime-trace";

export function brandTrace(
  scope: string,
  event: string,
  payload?: BrandRuntimeTracePayload
) {
  if (typeof window === "undefined") return;

  const row = {
    time: new Date().toISOString(),
    scope,
    event,
    payload,
  };

  window.__brandTrace = window.__brandTrace || [];
  window.__brandTrace.push(row);

  try {
    localStorage.setItem(TRACE_KEY, JSON.stringify(window.__brandTrace.slice(-200)));
  } catch {
    // ignore storage quota/private mode
  }

  console.log("[BRAND_TRACE]", row);

  if (!window.__exportBrandTrace) {
    window.__exportBrandTrace = () => {
      const value = JSON.stringify(window.__brandTrace || [], null, 2);
      console.log(value);
      return value;
    };
  }

  if (!window.__clearBrandTrace) {
    window.__clearBrandTrace = () => {
      window.__brandTrace = [];
      localStorage.removeItem(TRACE_KEY);
      console.log("[BRAND_TRACE] cleared");
    };
  }
}

export function brandTraceError(scope: string, event: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  brandTrace(scope, event, { error: message });
}
