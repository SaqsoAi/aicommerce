"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import BrandingAssetUploader from "@/components/store-settings/BrandingAssetUploader";

type SettingFieldLike = {
  id: string;
  key?: string;
  name?: string;
  label?: string;
  type?: string;
  category?: string;
  group?: string;
  value?: unknown;
  defaultValue?: unknown;
};

type BrandingUploadType =
  | "logo"
  | "dark-logo"
  | "white-logo"
  | "footer-logo"
  | "favicon"
  | "invoice-logo"
  | "email-logo"
  | "mobile-logo"
  | "pwa-icon";

type Props = {
  field: SettingFieldLike;
  value: string;
  apiBase: string;
  onValueChange: (value: string) => void;
  onSaved: () => Promise<void> | void;
};

type AssetRule = {
  tokens: string[];
  uploadType: BrandingUploadType;
  title: string;
  recommended: string;
  aspectRatio: string;
  maxSize: string;
  description: string;
};

const BRANDING_ASSETS: AssetRule[] = [
  {
    tokens: ["brandlogo", "brand_logo", "mainlogo", "main_logo", "storelogo", "store_logo", "logo"],
    uploadType: "logo",
    title: "Brand Logo",
    recommended: "512×512",
    aspectRatio: "1:1",
    maxSize: "2 MB",
    description: "Primary brand logo for header and general storefront use.",
  },
  {
    tokens: ["footerlogo", "footer_logo"],
    uploadType: "footer-logo",
    title: "Footer Logo",
    recommended: "600×200",
    aspectRatio: "3:1",
    maxSize: "2 MB",
    description: "Wide logo optimized for footer blocks.",
  },
  {
    tokens: ["darklogo", "dark_logo", "logodark", "logo_dark"],
    uploadType: "dark-logo",
    title: "Dark Logo",
    recommended: "512×512",
    aspectRatio: "1:1",
    maxSize: "2 MB",
    description: "Logo version for light backgrounds.",
  },
  {
    tokens: ["whitelogo", "white_logo", "logowhite", "logo_white", "lightlogo", "light_logo"],
    uploadType: "white-logo",
    title: "White Logo",
    recommended: "512×512",
    aspectRatio: "1:1",
    maxSize: "2 MB",
    description: "Logo version for dark backgrounds.",
  },
  {
    tokens: ["mobilelogo", "mobile_logo"],
    uploadType: "mobile-logo",
    title: "Mobile Logo",
    recommended: "256×256",
    aspectRatio: "1:1",
    maxSize: "1 MB",
    description: "Compact logo for mobile header and app surfaces.",
  },
  {
    tokens: ["invoicelogo", "invoice_logo"],
    uploadType: "invoice-logo",
    title: "Invoice Logo",
    recommended: "800×250",
    aspectRatio: "16:5",
    maxSize: "2 MB",
    description: "Wide logo for invoices, receipts and billing documents.",
  },
  {
    tokens: ["emaillogo", "email_logo"],
    uploadType: "email-logo",
    title: "Email Logo",
    recommended: "600×200",
    aspectRatio: "3:1",
    maxSize: "2 MB",
    description: "Email header logo for transactional and marketing emails.",
  },
  {
    tokens: ["favicon", "browsericon", "browser_icon"],
    uploadType: "favicon",
    title: "Favicon",
    recommended: "64×64",
    aspectRatio: "1:1",
    maxSize: "512 KB",
    description: "Browser tab icon.",
  },
  {
    tokens: ["appletouchicon", "apple_touch_icon", "appleicon", "apple_icon"],
    uploadType: "pwa-icon",
    title: "Apple Touch Icon",
    recommended: "180×180",
    aspectRatio: "1:1",
    maxSize: "1 MB",
    description: "Apple device home-screen icon.",
  },
  {
    tokens: ["androidicon", "android_icon"],
    uploadType: "pwa-icon",
    title: "Android Icon",
    recommended: "192×192",
    aspectRatio: "1:1",
    maxSize: "1 MB",
    description: "Android launcher icon.",
  },
  {
    tokens: ["pwaicon", "pwa_icon", "appicon", "app_icon"],
    uploadType: "pwa-icon",
    title: "PWA Icon",
    recommended: "512×512",
    aspectRatio: "1:1",
    maxSize: "2 MB",
    description: "Large progressive web app icon.",
  },
];

function normalize(value?: string) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function assetMatch(field: SettingFieldLike) {
  const haystack = [
    field.id,
    field.key,
    field.name,
    field.label,
    field.type,
    field.category,
    field.group,
  ]
    .map(normalize)
    .join("|");

  const direct = BRANDING_ASSETS.find((item) =>
    item.tokens.some((token) => haystack.includes(normalize(token)))
  );

  if (direct) return direct;

  const looksLikeImageField =
    haystack.includes("image") ||
    haystack.includes("asset") ||
    haystack.includes("icon") ||
    haystack.includes("logo");

  if (!looksLikeImageField) return null;

  return null;
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  if (typeof window === "undefined") return extra || {};
  const token = localStorage.getItem("token");
  return token ? { ...(extra || {}), Authorization: `Bearer ${token}` } : extra || {};
}

function notifyBrandRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("ai-commerce-brand-refresh"));
  window.dispatchEvent(new Event("ai-commerce-settings-refresh"));
  window.dispatchEvent(new Event("storage"));
}

function isImageUrl(value: string) {
  if (!value) return false;
  return /\.(png|jpe?g|webp|svg|avif|ico)(\?.*)?$/i.test(value) || value.includes("/uploads/branding/");
}

function filename(value: string) {
  if (!value) return "No asset selected";
  try {
    return decodeURIComponent(value.split("/").pop() || value);
  } catch {
    return value.split("/").pop() || value;
  }
}

export default function BrandingAssetBindingField({
  field,
  value,
  apiBase,
  onValueChange,
  onSaved,
}: Props) {
  const match = assetMatch(field);
  if (!match) return null;

  const currentValue = String(value || "");
  const defaultValue = String(field.defaultValue || "");

  async function patchField(nextValue: string) {
    onValueChange(nextValue);

    const res = await fetch(`${apiBase}/enterprise-settings/field/${field.id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ value: nextValue }),
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {}

    if (!res.ok || json?.success === false) {
      throw new Error(json?.message || "Asset action completed but settings PATCH failed");
    }

    notifyBrandRefresh();
    await onSaved();
  }

  async function removeAsset() {
    await patchField("");
  }

  async function resetAsset() {
    await patchField(defaultValue || "");
  }

  return (
    <div className="mb-4 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white">{match.title}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
            {match.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-black text-slate-600 dark:text-slate-200 sm:text-right">
          <span className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-black/20">
            Size {match.recommended}
          </span>
          <span className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-black/20">
            Ratio {match.aspectRatio}
          </span>
          <span className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-black/20">
            Max {match.maxSize}
          </span>
          <span className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-black/20">
            PNG JPG WEBP SVG AVIF
          </span>
        </div>
      </div>

      {currentValue ? (
        <div className="mb-3 flex items-center gap-3 rounded-3xl border border-white/80 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/10">
            {isImageUrl(currentValue) ? (
              <img src={currentValue} alt={match.title} className="h-full w-full object-contain" />
            ) : (
              <span className="px-2 text-center text-[10px] font-black text-slate-400">ASSET</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-slate-700 dark:text-slate-100">
              {filename(currentValue)}
            </p>
            <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
              Current saved value: {currentValue}
            </p>
          </div>
        </div>
      ) : null}

      <BrandingAssetUploader
        label={`${match.title} Upload / Replace`}
        type={match.uploadType}
        value={currentValue}
        onUploaded={patchField}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={removeAsset}
          disabled={!currentValue}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400/20 dark:bg-black/20 dark:text-red-200"
        >
          <Trash2 size={14} />
          Remove
        </button>

        <button
          type="button"
          onClick={resetAsset}
          disabled={!defaultValue || currentValue === defaultValue}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-black/20 dark:text-slate-200"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-black/20 dark:text-emerald-200">
        Upload success → PATCH Enterprise Settings → refresh list → BrandProvider live refresh.
      </div>
    </div>
  );
}