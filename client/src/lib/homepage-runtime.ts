import "server-only";
import { adaptHomepageSections } from "@/lib/homepage-section-contract";
import type { HomepageRuntimeContext, HomepageRuntimeResult, HomepageTemplateKey } from "@/types/homepage-runtime";

const DEFAULT_TEMPLATE: HomepageTemplateKey = "saqsobuild";
const TEMPLATE_KEYS = new Set<HomepageTemplateKey>(["fashion", "luxury", "modern", "saqsobuild"]);

function apiBase(): string { const configured = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000/api"; const clean = configured.replace(/\/$/, ""); return clean.endsWith("/api") ? clean : `${clean}/api`; }
function normalizeTemplate(value: unknown): HomepageTemplateKey | null { const candidate = String(value || "").trim().toLowerCase() as HomepageTemplateKey; return TEMPLATE_KEYS.has(candidate) ? candidate : null; }
function settingValue(payload: unknown, keys: readonly string[]): unknown {
  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase().replace(/[\s_-]/g, "")));
  const rows = Array.isArray(payload) ? payload : typeof payload === "object" && payload !== null && Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: unknown[] }).data : [];
  for (const row of rows) { if (typeof row !== "object" || row === null) continue; const record = row as Record<string, unknown>; const key = String(record.key ?? record.name ?? record.label ?? record.id ?? "").toLowerCase().replace(/[\s_-]/g, ""); if (normalizedKeys.has(key)) return record.value ?? record.valueJson ?? record.defaultValue; }
  return undefined;
}
async function readJson(path: string): Promise<unknown> { const response = await fetch(`${apiBase()}${path}`, { cache: "no-store", headers: { Accept: "application/json" } }); if (!response.ok) throw new Error(`Homepage runtime dependency failed with status ${response.status}`); return response.json(); }

export async function resolveHomepageRuntime(context: HomepageRuntimeContext): Promise<HomepageRuntimeResult> {
  if (context.mode === "preview") return { context, template: DEFAULT_TEMPLATE, sections: [], state: "api-error", message: "Homepage preview is not available until the authorized revision service is implemented." };
  try {
    const [settingsPayload, sectionsPayload] = await Promise.all([readJson("/enterprise-settings"), readJson("/homepage-sections/active")]);
    const template = normalizeTemplate(settingValue(settingsPayload, ["homepageTemplate", "storeTemplate", "template", "activeTemplate"])) ?? DEFAULT_TEMPLATE;
    const sections = adaptHomepageSections(sectionsPayload);
    return { context, template, sections, state: sections.length > 0 ? "ready" : "empty", message: sections.length > 0 ? undefined : "No published homepage sections are configured." };
  } catch { return { context, template: DEFAULT_TEMPLATE, sections: [], state: "api-error", message: "The homepage is temporarily unavailable." }; }
}
