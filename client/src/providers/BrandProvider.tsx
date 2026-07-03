"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type BrandState = {
  storeName: string;
  shortName: string;
  slogan: string;
  description: string;

  logoUrl: string;
  appIconUrl: string;
  footerLogoUrl: string;
  darkLogoUrl: string;
  whiteLogoUrl: string;
  mobileLogoUrl: string;
  invoiceLogoUrl: string;
  emailLogoUrl: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  androidIconUrl: string;
  pwaIconUrl: string;

  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  themeColor: string;

  contactEmail: string;
  contactPhone: string;
  address: string;
  website: string;

  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    linkedin: string;
  };

  raw: Record<string, string>;
  loaded: boolean;
};

type BrandContextValue = {
  brand: BrandState;
  setBrand: React.Dispatch<React.SetStateAction<BrandState>>;
  refreshBrand: () => Promise<void>;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000";

const DEFAULT_BRAND: BrandState = {
  storeName: "SAQSO",
  shortName: "SQ",
  slogan: "",
  description: "",

  logoUrl: "",
  appIconUrl: "",
  footerLogoUrl: "",
  darkLogoUrl: "",
  whiteLogoUrl: "",
  mobileLogoUrl: "",
  invoiceLogoUrl: "",
  emailLogoUrl: "",
  faviconUrl: "",
  appleTouchIconUrl: "",
  androidIconUrl: "",
  pwaIconUrl: "",

  primaryColor: "#c74b21",
  secondaryColor: "#111827",
  accentColor: "#f59e0b",
  themeColor: "#c74b21",

  contactEmail: "",
  contactPhone: "",
  address: "",
  website: "",

  socials: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    linkedin: "",
  },

  raw: {},
  loaded: false,
};

const BrandContext = createContext<BrandContextValue>({
  brand: DEFAULT_BRAND,
  setBrand: () => undefined,
  refreshBrand: async () => undefined,
});

function apiPath(path: string) {
  const base = API_BASE.replace(/\/$/, "");
  const apiBase = base.endsWith("/api") ? base : `${base}/api`;
  return `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
}

function serverOrigin() {
  const base = API_BASE.replace(/\/$/, "");
  return base.endsWith("/api") ? base.replace(/\/api$/, "") : base;
}

export function normalizeAssetUrl(value?: string) {
  const clean = String(value || "").trim();

  if (!clean) return "";
  if (clean.startsWith("blob:")) return clean;
  if (clean.startsWith("data:")) return clean;
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  if (clean.startsWith("/")) return `${serverOrigin()}${clean}`;

  return `${serverOrigin()}/${clean}`;
}

function valueOf(item: any) {
  const value = item?.value ?? item?.valueJson ?? item?.defaultValue ?? "";
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
}

function flattenSettingsPayload(payload: any): any[] {
  const rows: any[] = [];
  const seen = new Set<string>();

  function pushRow(row: any) {
    if (!row || typeof row !== "object") return;

    const key = row.key || row.name;
    if (!key) return;

    const id = row.id || `${key}:${rows.length}`;
    const fingerprint = `${id}:${key}:${row.aliasOf || ""}`;

    if (seen.has(fingerprint)) return;
    seen.add(fingerprint);
    rows.push(row);
  }

  function pushMany(list: any) {
    if (!Array.isArray(list)) return;

    for (const item of list) {
      if (Array.isArray(item?.fields)) {
        for (const field of item.fields) {
          pushRow({
            ...field,
            groupKey: field.groupKey || item.key,
            group: field.group || item.label || item.key,
            category: field.category || item.label || item.key,
          });
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

function parseSettings(payload: any): BrandState {
  const list = flattenSettingsPayload(payload);
  const raw: Record<string, string> = {};

  for (const item of list) {
    const key = String(item?.key || item?.name || "").trim();
    if (!key) continue;

    const value = valueOf(item);

    if (raw[key] === undefined || raw[key] === "") {
      raw[key] = value;
    }

    if (item?.aliasOf && raw[item.aliasOf] === undefined) {
      raw[item.aliasOf] = value;
    }
  }

  const pickRaw = (...keys: string[]) => {
    for (const key of keys) {
      const value = raw[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value);
      }
    }
    return "";
  };

  const next: BrandState = {
    ...DEFAULT_BRAND,
    storeName: pickRaw("storeName", "store_name", "name") || DEFAULT_BRAND.storeName,
    shortName: pickRaw("shortName", "short_name") || DEFAULT_BRAND.shortName,
    slogan: pickRaw("slogan", "tagline", "storeTagline"),
    description: pickRaw("storeDescription", "description", "storeTagline"),

    logoUrl: normalizeAssetUrl(
      pickRaw("logoUrl", "logo", "websiteLogo", "headerLogoUrl", "headerLogo", "mainLogo", "brandLogo", "storeLogo")
    ),
    appIconUrl: normalizeAssetUrl(
      pickRaw("appIconUrl", "appIcon", "app_icon_url", "app_icon", "pwaIconUrl", "pwaIcon", "faviconUrl", "favicon")
    ),
    footerLogoUrl: normalizeAssetUrl(
      pickRaw("footerLogoUrl", "footerLogo", "logoUrl", "logo", "whiteLogoUrl", "whiteLogo")
    ),
    darkLogoUrl: normalizeAssetUrl(pickRaw("darkLogoUrl", "darkLogo")),
    whiteLogoUrl: normalizeAssetUrl(pickRaw("whiteLogoUrl", "whiteLogo")),
    mobileLogoUrl: normalizeAssetUrl(pickRaw("mobileLogoUrl", "mobileLogo", "appIconUrl", "appIcon")),
    invoiceLogoUrl: normalizeAssetUrl(pickRaw("invoiceLogoUrl", "invoiceLogo", "logoUrl", "logo")),
    emailLogoUrl: normalizeAssetUrl(pickRaw("emailLogoUrl", "emailLogo", "logoUrl", "logo")),
    faviconUrl: normalizeAssetUrl(
      pickRaw("faviconUrl", "favicon", "appIconUrl", "appIcon", "pwaIconUrl", "pwaIcon")
    ),
    appleTouchIconUrl: normalizeAssetUrl(
      pickRaw("appleTouchIconUrl", "appleTouchIcon", "pwaIconUrl", "pwaIcon", "appIconUrl", "appIcon")
    ),
    androidIconUrl: normalizeAssetUrl(
      pickRaw("androidIconUrl", "androidIcon", "pwaIconUrl", "pwaIcon", "appIconUrl", "appIcon")
    ),
    pwaIconUrl: normalizeAssetUrl(pickRaw("pwaIconUrl", "pwaIcon", "appIconUrl", "appIcon")),

    primaryColor: pickRaw("primaryColor", "primary_color") || DEFAULT_BRAND.primaryColor,
    secondaryColor: pickRaw("secondaryColor", "secondary_color") || DEFAULT_BRAND.secondaryColor,
    accentColor: pickRaw("accentColor", "accent_color") || DEFAULT_BRAND.accentColor,
    themeColor: pickRaw("themeColor", "theme_color", "primaryColor") || DEFAULT_BRAND.themeColor,

    contactEmail: pickRaw("contactEmail", "supportEmail"),
    contactPhone: pickRaw("contactPhone", "supportPhone"),
    address: pickRaw("address", "storeAddress", "officialAddress"),
    website: pickRaw("website"),

    socials: {
      facebook: pickRaw("facebook", "facebookPageUrl"),
      instagram: pickRaw("instagram", "instagramProfileUrl"),
      tiktok: pickRaw("tiktok", "tiktokProfileUrl"),
      youtube: pickRaw("youtube", "youtubeChannelUrl"),
      linkedin: pickRaw("linkedin"),
    },

    raw,
    loaded: true,
  };

  return next;
}

function exposeBrandDebug(brand: BrandState) {
  if (typeof window === "undefined") return;

  (window as any).__AI_COMMERCE_BRAND__ = brand;
  (window as any).__AI_COMMERCE_BRAND_RAW__ = brand.raw;

  try {
    localStorage.setItem("ai-commerce-brand-state", JSON.stringify(brand));
  } catch {
    // ignore
  }
}

function applyBrowserBrand(brand: BrandState) {
  if (typeof document === "undefined") return;

  if (brand.storeName) {
    document.title = brand.storeName;
  }

  const favicon = brand.faviconUrl || brand.appIconUrl || brand.pwaIconUrl;

  if (favicon) {
    let icon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = favicon;
  }

  if (brand.themeColor) {
    let theme = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");
    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      document.head.appendChild(theme);
    }
    theme.content = brand.themeColor;
  }
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandState>(DEFAULT_BRAND);

  const refreshBrand = useCallback(async () => {
    try {
      const endpoint = apiPath("/enterprise-settings");
      const res = await fetch(endpoint, { cache: "no-store" });
      const json = await res.json();

      const next = parseSettings(json);

      setBrand(next);
      exposeBrandDebug(next);
      applyBrowserBrand(next);

      console.log("[BrandProvider] loaded", {
        endpoint,
        fieldCount: Object.keys(next.raw).length,
        storeName: next.storeName,
        logoUrl: next.logoUrl,
        appIconUrl: next.appIconUrl,
        faviconUrl: next.faviconUrl,
      });
    } catch (error) {
      console.error("[BrandProvider] failed to load brand", error);
      const fallback = { ...DEFAULT_BRAND, loaded: true };
      setBrand(fallback);
      exposeBrandDebug(fallback);
    }
  }, []);

  useEffect(() => {
    refreshBrand();

    const onRefresh = () => refreshBrand();

    window.addEventListener("storage", onRefresh);
    window.addEventListener("ai-commerce-brand-refresh", onRefresh);
    window.addEventListener("ai-commerce-settings-refresh", onRefresh);

    return () => {
      window.removeEventListener("storage", onRefresh);
      window.removeEventListener("ai-commerce-brand-refresh", onRefresh);
      window.removeEventListener("ai-commerce-settings-refresh", onRefresh);
    };
  }, [refreshBrand]);

  useEffect(() => {
    exposeBrandDebug(brand);
    applyBrowserBrand(brand);
  }, [brand]);

  const value = useMemo<BrandContextValue>(
    () => ({
      brand,
      setBrand,
      refreshBrand,
    }),
    [brand, refreshBrand]
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrandContext() {
  return useContext(BrandContext);
}

export function useBrand() {
  return useContext(BrandContext);
}
