"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, RefreshCw, RotateCcw, Save, Send, Sparkles } from "lucide-react";
import BrandingAssetUploader from "@/components/store-settings/BrandingAssetUploader";
import AIBrandAssetGenerator from "@/components/store-settings/AIBrandAssetGenerator";
import { brandTrace, brandTraceError } from "@/components/store-settings/brandRuntimeTrace";

type Field = {
  id: string;
  key?: string;
  name?: string;
  label?: string;
  value?: any;
  valueJson?: any;
  groupKey?: string;
  group?: string;
};

type CoreItem = {
  key: string;
  aliases?: string[];
  label: string;
  type: "text" | "textarea" | "color" | "asset";
  uploadType?: "logo" | "dark-logo" | "white-logo" | "footer-logo" | "favicon" | "mobile-logo" | "invoice-logo" | "email-logo" | "pwa-icon";
  hint?: string;
  recommended?: string;
  ratio?: string;
  maxSize?: string;
};

const RAW_API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000";

function apiPath(path: string) {
  const base = RAW_API.replace(/\/$/, "");
  const apiBase = base.endsWith("/api") ? base : `${base}/api`;
  return `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
}

function serverOrigin() {
  const base = RAW_API.replace(/\/$/, "");
  return base.endsWith("/api") ? base.replace(/\/api$/, "") : base;
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  if (typeof window === "undefined") return extra || {};
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("accessToken");

  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const CORE_ITEMS: CoreItem[] = [
  { key: "storeName", aliases: ["store_name"], label: "Store Name", type: "text", hint: "Client header/title uses this" },
  { key: "shortName", aliases: ["short_name"], label: "Short Name", type: "text", hint: "Small logo fallback" },
  { key: "slogan", aliases: ["tagline"], label: "Slogan / Tagline", type: "text", hint: "Short brand slogan" },
  { key: "storeDescription", aliases: ["description", "store_description"], label: "Store Description", type: "textarea", hint: "Browser description / SEO fallback" },

  { key: "appIconUrl", aliases: ["appIcon", "app_icon", "app_icon_url", "pwaIcon", "pwaIconUrl"], label: "App Icon / Header Icon", type: "asset", uploadType: "pwa-icon", hint: "Header left square icon", recommended: "512 x 512 px", ratio: "1:1", maxSize: "2 MB" },
  { key: "logoUrl", aliases: ["logo", "websiteLogo", "website_logo", "headerLogo", "header_logo"], label: "Website Logo / Header Logo", type: "asset", uploadType: "logo", hint: "Header website logo", recommended: "600 x 200 px", ratio: "3:1", maxSize: "2 MB" },
  { key: "footerLogoUrl", aliases: ["footerLogo", "footer_logo", "footer_logo_url"], label: "Footer Logo", type: "asset", uploadType: "footer-logo", hint: "Footer brand logo", recommended: "600 x 200 px", ratio: "3:1", maxSize: "2 MB" },
  { key: "darkLogoUrl", aliases: ["darkLogo", "dark_logo", "dark_logo_url"], label: "Dark Logo", type: "asset", uploadType: "dark-logo", hint: "Logo for light background", recommended: "600 x 200 px", ratio: "3:1", maxSize: "2 MB" },
  { key: "whiteLogoUrl", aliases: ["whiteLogo", "white_logo", "white_logo_url"], label: "White Logo", type: "asset", uploadType: "white-logo", hint: "Logo for dark background", recommended: "600 x 200 px", ratio: "3:1", maxSize: "2 MB" },
  { key: "mobileLogoUrl", aliases: ["mobileLogo", "mobile_logo", "mobile_logo_url"], label: "Mobile Logo", type: "asset", uploadType: "mobile-logo", hint: "Mobile compact logo", recommended: "256 x 256 px", ratio: "1:1", maxSize: "1 MB" },
  { key: "invoiceLogoUrl", aliases: ["invoiceLogo", "invoice_logo", "invoice_logo_url"], label: "Invoice Logo", type: "asset", uploadType: "invoice-logo", hint: "Invoice/receipt logo", recommended: "800 x 250 px", ratio: "16:5", maxSize: "2 MB" },
  { key: "emailLogoUrl", aliases: ["emailLogo", "email_logo", "email_logo_url"], label: "Email Logo", type: "asset", uploadType: "email-logo", hint: "Email logo", recommended: "600 x 200 px", ratio: "3:1", maxSize: "2 MB" },
  { key: "faviconUrl", aliases: ["favicon", "favicon_url"], label: "Favicon", type: "asset", uploadType: "favicon", hint: "Browser tab icon", recommended: "64 x 64 px", ratio: "1:1", maxSize: "512 KB" },
  { key: "appleTouchIconUrl", aliases: ["appleTouchIcon", "apple_touch_icon", "apple_touch_icon_url"], label: "Apple Touch Icon", type: "asset", uploadType: "pwa-icon", hint: "iOS home-screen icon", recommended: "180 x 180 px", ratio: "1:1", maxSize: "1 MB" },
  { key: "androidIconUrl", aliases: ["androidIcon", "android_icon", "android_icon_url"], label: "Android Icon", type: "asset", uploadType: "pwa-icon", hint: "Android launcher icon", recommended: "192 x 192 px", ratio: "1:1", maxSize: "1 MB" },
  { key: "pwaIconUrl", aliases: ["pwaIcon", "pwa_icon", "pwa_icon_url"], label: "PWA Icon", type: "asset", uploadType: "pwa-icon", hint: "PWA large icon", recommended: "512 x 512 px", ratio: "1:1", maxSize: "2 MB" },

  { key: "primaryColor", aliases: ["primary_color"], label: "Primary Color", type: "color", hint: "CTA / main accent" },
  { key: "secondaryColor", aliases: ["secondary_color"], label: "Secondary Color", type: "color", hint: "Secondary accent" },
  { key: "accentColor", aliases: ["accent_color"], label: "Accent Color", type: "color", hint: "Highlights" },

  { key: "contactEmail", aliases: ["contact_email"], label: "Contact Email", type: "text", hint: "Footer/account support" },
  { key: "contactPhone", aliases: ["contact_phone"], label: "Contact Phone", type: "text", hint: "Footer/checkout support" },
  { key: "address", label: "Address", type: "textarea", hint: "Footer address" },
  { key: "website", label: "Website", type: "text", hint: "Official website URL" },
  { key: "facebook", label: "Facebook", type: "text", hint: "Facebook page URL" },
  { key: "instagram", label: "Instagram", type: "text", hint: "Instagram profile URL" },
  { key: "tiktok", label: "TikTok", type: "text", hint: "TikTok profile URL" },
  { key: "youtube", label: "YouTube", type: "text", hint: "YouTube channel URL" },
];

function normalize(value?: string) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchItem(field: Field, item: CoreItem) {
  const fieldKeys = [
    field.key,
    field.name,
    field.label,
    (field as any).aliasOf,
  ].map(normalize);

  const itemKeys = [
    item.key,
    item.label,
    ...(item.aliases || []),
  ].map(normalize);

  return itemKeys.some((key) =>
    fieldKeys.includes(key) ||
    fieldKeys.some((fieldKey) => fieldKey === key || fieldKey.includes(key))
  );
}

function valueOf(field?: any) {
  if (!field) return "";

  const candidates = [
    field.value,
    field.valueJson,
    field.defaultValue,
    field.data?.value,
    field.data?.valueJson,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === "object") {
      try {
        const stringValue = JSON.stringify(candidate);
        if (stringValue && stringValue !== "null" && stringValue !== "{}") return stringValue;
      } catch {
        continue;
      }
    }

    const stringValue = String(candidate);
    if (stringValue.trim() !== "") return stringValue;
  }

  return "";
}

function extractFields(payload: any): Field[] {
  const rows: Field[] = [];
  const seen = new Set<string>();

  function pushRow(row: any, group?: any) {
    if (!row || typeof row !== "object") return;

    const key = row.key || row.name;
    if (!key) return;

    const normalized: Field = {
      ...row,
      key,
      name: row.name || key,
      groupKey: row.groupKey || group?.key,
      group: row.group || group?.label || group?.key,
      label: row.label || key,
      value: valueOf(row),
      valueJson: row.valueJson ?? row.value ?? "",
    };

    const fingerprint = `${normalized.id || ""}:${normalized.key}:${(normalized as any).aliasOf || ""}:${rows.length}`;
    if (seen.has(fingerprint)) return;

    seen.add(fingerprint);
    rows.push(normalized);
  }

  function pushMany(list: any) {
    if (!Array.isArray(list)) return;

    for (const item of list) {
      if (Array.isArray(item?.fields)) {
        for (const field of item.fields) {
          pushRow(field, item);
        }
      } else {
        pushRow(item);
      }
    }
  }

  if (Array.isArray(payload)) pushMany(payload);

  pushMany(payload?.data);
  pushMany(payload?.settings);
  pushMany(payload?.fields);
  pushMany(payload?.groups);

  if (Array.isArray(payload?.data?.groups)) pushMany(payload.data.groups);
  if (Array.isArray(payload?.data?.settings)) pushMany(payload.data.settings);
  if (Array.isArray(payload?.data?.fields)) pushMany(payload.data.fields);

  return rows;
}

function extractUploadUrl(payload: any) {
  if (typeof payload === "string") return payload;
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  return (
    payload.url ||
    payload.path ||
    payload.src ||
    payload.fileUrl ||
    payload.publicUrl ||
    payload.data?.url ||
    payload.data?.path ||
    payload.data?.src ||
    payload.data?.fileUrl ||
    payload.data?.publicUrl ||
    payload.file?.url ||
    ""
  );
}

function previewUrl(value: string) {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return `${serverOrigin()}${value}`;
  return `${serverOrigin()}/${value}`;
}

function notifyBrandRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("ai-commerce-brand-refresh"));
  window.dispatchEvent(new Event("ai-commerce-settings-refresh"));
  window.dispatchEvent(new Event("storage"));
}

function groupKeyFor(item: CoreItem) {
  if (item.type === "asset") return "assets";
  if (item.type === "color") return "theme";
  if (["contactEmail", "contactPhone", "address", "website"].includes(item.key)) return "contact";
  if (["facebook", "instagram", "tiktok", "youtube"].includes(item.key)) return "social";
  return "brand";
}

export default function EnterpriseBrandCoreForm() {
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fieldMap = useMemo(() => {
    const map: Record<string, Field | undefined> = {};
    CORE_ITEMS.forEach((item) => {
      map[item.key] = fields.find((field) => matchItem(field, item));
    });
    return map;
  }, [fields]);

  const dirtyCount = useMemo(() => {
    return CORE_ITEMS.filter((item) => (values[item.key] ?? "") !== (originalValues[item.key] ?? "")).length;
  }, [values, originalValues]);

  async function readJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  async function load() {
    brandTrace("EnterpriseBrandCoreForm", "load:start", {
      endpoint: apiPath("/enterprise-settings"),
    });
    setLoading(true);

    try {
      const res = await fetch(apiPath("/enterprise-settings"), {
        headers: authHeaders(),
        cache: "no-store",
      });

      const json = await readJson(res);
      brandTrace("EnterpriseBrandCoreForm", "load:response", {
        ok: res.ok,
        status: res.status,
        hasJson: Boolean(json),
      });

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || "Failed to load enterprise settings.");
      }

      const list = extractFields(json);
setFields(list);

      brandTrace("EnterpriseBrandCoreForm", "mapping:fixed-summary", {
        fieldCount: list.length,
        assets: list
          .filter((field: any) =>
            ["logo", "logoUrl", "appIcon", "appIconUrl", "favicon", "faviconUrl", "pwaIcon", "pwaIconUrl"].includes(field?.key)
          )
          .map((field: any) => ({
            key: field.key,
            aliasOf: field.aliasOf,
            value: valueOf(field),
          })),
      });

      const next: Record<string, string> = {};

      CORE_ITEMS.forEach((item) => {
        const candidates = list.filter((field) => matchItem(field, item));
        const matched =
          candidates.find((field) => valueOf(field)) ||
          candidates.find((field) => normalize(field.key) === normalize(item.key)) ||
          candidates[0];

        const nextValue = valueOf(matched);
        next[item.key] = nextValue;

        if (["logoUrl", "appIconUrl", "faviconUrl", "pwaIconUrl"].includes(item.key)) {
          brandTrace("EnterpriseBrandCoreForm", "mapping:item-resolve", {
            itemKey: item.key,
            itemAliases: item.aliases || [],
            matched: matched
              ? {
                  id: matched.id,
                  key: matched.key,
                  name: matched.name,
                  aliasOf: (matched as any).aliasOf,
                  sourceFieldId: (matched as any).sourceFieldId,
                  value: matched.value,
                  valueJson: matched.valueJson,
                }
              : null,
            nextValue,
          });
        }
      });

      brandTrace("EnterpriseBrandCoreForm", "mapping:next-values", {
        storeName: next.storeName,
        shortName: next.shortName,
        logoUrl: next.logoUrl,
        appIconUrl: next.appIconUrl,
        faviconUrl: next.faviconUrl,
        pwaIconUrl: next.pwaIconUrl,
      });

      setValues(next);
      setOriginalValues(next);
      brandTrace("EnterpriseBrandCoreForm", "load:success", {
        fieldCount: list.length,
        logoUrl: next.logoUrl,
        appIconUrl: next.appIconUrl,
      });
      setStatus("Loaded latest brand settings.");
    } catch (error: any) {
      console.error(error);
      brandTraceError("EnterpriseBrandCoreForm", "load:error", error);
      setStatus(error?.message || "Failed to load enterprise settings.");
    } finally {
      setLoading(false);
    }
  }

  async function seed() {
    brandTrace("EnterpriseBrandCoreForm", "seed:start", {
      endpoint: apiPath("/enterprise-settings/seed"),
    });
    setStatus("Initializing core settings...");

    const res = await fetch(apiPath("/enterprise-settings/seed"), {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });

    const json = await readJson(res);
      brandTrace("EnterpriseBrandCoreForm", "load:response", {
        ok: res.ok,
        status: res.status,
        hasJson: Boolean(json),
      });

    if (!res.ok || json?.success === false) {
      throw new Error(json?.message || "Failed to initialize enterprise settings.");
    }

    await load();
  }

  async function ensureCoreGroup() {
    const res = await fetch(apiPath("/enterprise-settings/seed"), {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });

    if (!res.ok) {
      const json = await readJson(res);
      brandTrace("EnterpriseBrandCoreForm", "load:response", {
        ok: res.ok,
        status: res.status,
        hasJson: Boolean(json),
      });
      throw new Error(json?.message || "Failed to seed enterprise settings groups.");
    }
  }

  async function createMissingField(item: CoreItem) {
    brandTrace("EnterpriseBrandCoreForm", "createMissingField:start", {
      key: item.key,
      label: item.label,
      groupKey: groupKeyFor(item),
    });
    await ensureCoreGroup();

    brandTrace("EnterpriseBrandCoreForm", "createMissingField:request", {
      endpoint: apiPath("/enterprise-settings/field"),
      key: item.key,
      groupKey: groupKeyFor(item),
    });

    const res = await fetch(apiPath("/enterprise-settings/field"), {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        key: item.key,
        name: item.key,
        label: item.label,
        type: item.type === "asset" ? "file" : item.type,
        value: "",
        groupKey: groupKeyFor(item),
        sortOrder: 999,
        enabled: true,
      }),
    });

    const json = await readJson(res);
      brandTrace("EnterpriseBrandCoreForm", "load:response", {
        ok: res.ok,
        status: res.status,
        hasJson: Boolean(json),
      });

    if (!res.ok || json?.success === false) {
      throw new Error(json?.message || `Failed to create field for ${item.label}`);
    }

    const created = json?.data || json?.field || json;

    if (!created?.id) {
      await load();
      const refreshed = fields.find((field) => matchItem(field, item));
      if (refreshed?.id) return refreshed;
      throw new Error(`Field created for ${item.label}, but response did not include an id.`);
    }

    return created as Field;
  }

  async function patchField(item: CoreItem, value: string) {
    brandTrace("EnterpriseBrandCoreForm", "patchField:start", {
      key: item.key,
      label: item.label,
      hasValue: Boolean(value),
    });
    let field = fieldMap[item.key];

    if (!field?.id) {
      field = await createMissingField(item);
    }

    if (!field?.id) {
      throw new Error(`Missing enterprise settings field for ${item.label}.`);
    }

    brandTrace("EnterpriseBrandCoreForm", "patchField:request", {
      key: item.key,
      fieldId: field.id,
      endpoint: apiPath(`/enterprise-settings/field/${field.id}`),
    });

    const res = await fetch(apiPath(`/enterprise-settings/field/${field.id}`), {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ value }),
    });

    const json = await readJson(res);
      brandTrace("EnterpriseBrandCoreForm", "load:response", {
        ok: res.ok,
        status: res.status,
        hasJson: Boolean(json),
      });

    if (!res.ok || json?.success === false) {
      throw new Error(json?.message || `Failed to save ${item.label}`);
    }
  }

  async function saveItem(item: CoreItem, nextValue?: string) {
    const value = nextValue ?? values[item.key] ?? "";
    brandTrace("EnterpriseBrandCoreForm", "saveItem:start", {
      key: item.key,
      label: item.label,
      hasValue: Boolean(value),
      valuePreview: String(value).slice(0, 120),
    });
    setSaving(item.key);

    try {
      await patchField(item, value);
      setValues((prev) => ({ ...prev, [item.key]: value }));
      setOriginalValues((prev) => ({ ...prev, [item.key]: value }));
      notifyBrandRefresh();
      brandTrace("EnterpriseBrandCoreForm", "saveItem:success", {
        key: item.key,
        label: item.label,
      });
      setStatus(`${item.label} saved.`);
      await load();
    } catch (error: any) {
      console.error(error);
      brandTraceError("EnterpriseBrandCoreForm", `saveItem:error:${item.key}`, error);
      setStatus(error?.message || `Failed to save ${item.label}`);
    } finally {
      setSaving(null);
    }
  }

  async function saveAll() {
    setSaving("all");

    try {
      for (const item of CORE_ITEMS) {
        if ((values[item.key] ?? "") !== (originalValues[item.key] ?? "")) {
          await patchField(item, values[item.key] ?? "");
        }
      }

      notifyBrandRefresh();
      setStatus("All changed fields saved.");
      await load();
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || "Failed to save all changed fields.");
    } finally {
      setSaving(null);
    }
  }

  async function publish() {
    brandTrace("EnterpriseBrandCoreForm", "publish:start", {
      dirtyCount,
    });
    setPublishing(true);

    try {
      await saveAll();
      notifyBrandRefresh();
      setStatus("Published to client. Refresh client page to verify header/footer/favicon.");
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || "Failed to publish brand settings.");
    } finally {
      setPublishing(false);
    }
  }

  function resetLocal() {
    setValues(originalValues);
    setStatus("Unsaved changes reset.");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section
      data-enterprise-brand-core-form
      className="mt-6 overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/30"
    >
      <div className="border-b border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-slate-50 p-4 dark:border-white/10 dark:from-cyan-950/30 dark:via-slate-950 dark:to-black md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-500">
              White Label Core
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
              Enterprise Brand Studio
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500 dark:text-white/50">
              Upload one logo and one app icon, then use AI to generate all required white-label assets for light mode, dark mode, mobile, favicon and PWA.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={seed} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-white">
              <Sparkles size={16} /> Initialize
            </button>
            <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black dark:border-white/10 dark:bg-white/[0.06]">
              <RefreshCw size={16} /> Refresh
            </button>
            <button type="button" onClick={resetLocal} disabled={!dirtyCount} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06]">
              <RotateCcw size={16} /> Reset
            </button>
            <button type="button" onClick={saveAll} disabled={!dirtyCount || saving === "all"} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">
              <Save size={16} /> {saving === "all" ? "Saving..." : `Save ${dirtyCount ? `(${dirtyCount})` : ""}`}
            </button>
            <button type="button" onClick={publish} disabled={publishing} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white disabled:opacity-50">
              <Send size={16} /> {publishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-white/60 md:flex-row md:items-center md:justify-between">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            {status || "Ready"}
          </span>
          <span>{dirtyCount ? `${dirtyCount} unsaved change(s)` : "No unsaved changes"}</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step 01</p>
            <p className="mt-1 text-sm font-black">Upload Website Logo</p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-white/50">Recommended 600 × 200 transparent PNG.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step 02</p>
            <p className="mt-1 text-sm font-black">Upload App Icon</p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-white/50">Recommended 512 × 512 square PNG.</p>
          </div>
          <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-400/20 dark:bg-cyan-400/10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-200">Step 03</p>
            <p className="mt-1 text-sm font-black">Generate AI Assets</p>
            <p className="mt-1 text-xs font-bold text-slate-600 dark:text-white/60">White, black, mobile, favicon and PWA icons.</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-200">Step 04</p>
            <p className="mt-1 text-sm font-black">Publish Live</p>
            <p className="mt-1 text-xs font-bold text-slate-600 dark:text-white/60">Header, footer, favicon and login refresh.</p>
          </div>
        </div>
        <AIBrandAssetGenerator
          logoUrl={values.logoUrl}
          appIconUrl={values.appIconUrl}
          onGenerated={async (key, url) => {
            const item = CORE_ITEMS.find((entry) => entry.key === key);
            if (!item) throw new Error(`Missing generated field: ${key}`);
            await saveItem(item, url);
          }}
        />
      </div>

      {loading ? (
        <div className="p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-black dark:border-white/10 dark:bg-white/[0.04]">
            Loading core brand settings...
          </div>
        </div>
      ) : (
        <div className="grid gap-6 bg-slate-50/70 p-4 dark:bg-black/20 md:p-6">
          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {CORE_ITEMS.map((item) => {
              const missing = !fieldMap[item.key]?.id;
              const value = values[item.key] ?? "";

              return (
                <div key={item.key} className="group rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-100/70 dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-cyan-400/40 dark:hover:shadow-black/30">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-white/50">{item.label}</p>
                      {item.hint ? <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-white/45">{item.hint}</p> : null}
                    </div>
                    <span
                      className={[
                        "rounded-full px-2 py-1 text-[10px] font-black",
                        missing ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700",
                      ].join(" ")}
                    >
                      {missing ? "Missing" : "Bound"}
                    </span>
                  </div>

                  {item.type === "asset" && item.uploadType ? (
                    <div>
                      <BrandingAssetUploader
                        label={item.label}
                        type={item.uploadType}
                        value={value}
                        onUploaded={async (payload) => {
                          const url = extractUploadUrl(payload);
                          if (!url) throw new Error("Upload completed but no asset URL returned.");
                          await saveItem(item, url);
                        }}
                      />

                      <div className="mt-3 grid gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 p-3 text-xs font-bold text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100 sm:grid-cols-3">
                        <span>Recommended: {item.recommended}</span>
                        <span>Ratio: {item.ratio}</span>
                        <span>Max: {item.maxSize}</span>
                      </div>

                      {value ? (
                        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-black/20">
                          <img src={previewUrl(value)} alt={item.label} className="h-12 w-12 rounded-xl bg-white object-contain p-1" />
                          <p className="min-w-0 truncate text-xs font-bold text-slate-500 dark:text-white/50">{value}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : item.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(event) => setValues((prev) => ({ ...prev, [item.key]: event.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-black/20"
                    />
                  ) : item.type === "color" ? (
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={value || "#c74b21"}
                        onChange={(event) => setValues((prev) => ({ ...prev, [item.key]: event.target.value }))}
                        className="h-12 w-16 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10"
                      />
                      <input
                        value={value}
                        onChange={(event) => setValues((prev) => ({ ...prev, [item.key]: event.target.value }))}
                        className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-black/20"
                      />
                    </div>
                  ) : (
                    <input
                      value={value}
                      onChange={(event) => setValues((prev) => ({ ...prev, [item.key]: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-black/20"
                    />
                  )}

                  {item.type !== "asset" ? (
                    <button
                      type="button"
                      onClick={() => saveItem(item)}
                      disabled={saving === item.key}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                    >
                      <Save size={16} />
                      {saving === item.key ? "Saving..." : missing ? "Create & Save Field" : "Save Field"}
                    </button>
                  ) : null}

                  {missing ? (
                    <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                      Field missing. Save will auto-create this field.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-4 z-20 rounded-[1.7rem] border border-slate-200 bg-white/95 p-3 shadow-2xl shadow-slate-300/60 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 dark:shadow-black/40">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-xs font-bold text-slate-500 dark:text-white/50">
                <Eye size={14} className="mr-2 inline" />
                After Publish, verify client Header, Footer, Login, Checkout, Shop and Browser Favicon.
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={saveAll} disabled={!dirtyCount || saving === "all"} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">
                  Save All
                </button>
                <button type="button" onClick={publish} disabled={publishing} className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white disabled:opacity-50">
                  Publish to Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}








