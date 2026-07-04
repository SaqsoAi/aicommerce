// PHASE_3_2_TOP_RISK_HARDENED
/* PHASE_3_1_RESPONSIVE_GUARD */
"use client";

import { useEffect, useMemo, useState } from "react";

// SPRINT_1_7D_2_HERO_VERSION_TIMELINE
type HeroVersionRecord = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "RESTORED";
  user: string;
  note: string;
  createdAt: string;
  snapshot: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    qualityScore: number;
  };
};

const heroVersionSeed: HeroVersionRecord[] = [
  {
    id: "v4.2",
    title: "Current Published Version",
    status: "PUBLISHED",
    user: "Super Admin",
    note: "Live hero with latest crop and AI score.",
    createdAt: "Today 12:20 PM",
    snapshot: {
      headline: "Premium Fashion Collection",
      subheadline: "Premium fashion, smart shopping and rewards in one experience.",
      primaryCta: "Shop Collection",
      qualityScore: 94,
    },
  },
  {
    id: "v4.1",
    title: "AI Crop Draft",
    status: "DRAFT",
    user: "Admin",
    note: "Adjusted tablet/mobile focus and safe-zone.",
    createdAt: "Today 11:48 AM",
    snapshot: {
      headline: "Luxury Drop for Modern Buyers",
      subheadline: "AI optimized hero for desktop, tablet and mobile.",
      primaryCta: "Explore Style",
      qualityScore: 89,
    },
  },
  {
    id: "v4.0",
    title: "Original Upload",
    status: "RESTORED",
    user: "System",
    note: "Initial hero upload checkpoint.",
    createdAt: "Yesterday 08:12 PM",
    snapshot: {
      headline: "Summer Collection 2024",
      subheadline: "Create responsive AI-powered hero banners for every device.",
      primaryCta: "Shop Now",
      qualityScore: 82,
    },
  },
];

function HeroVersionTimelinePanel() {
  const [versions, setVersions] = useState<HeroVersionRecord[]>(heroVersionSeed);
  const [activeVersion, setActiveVersion] = useState<HeroVersionRecord>(heroVersionSeed[0]);
  const [restoreMessage, setRestoreMessage] = useState("");

  const restoreVersion = (version: HeroVersionRecord) => {
    setActiveVersion(version);
    setVersions((prev) =>
      prev.map((item) =>
        item.id === version.id
          ? { ...item, status: "RESTORED" }
          : item.status === "RESTORED"
            ? { ...item, status: "DRAFT" }
            : item
      )
    );
    setRestoreMessage(`${version.id} restored locally. Publish workflow will apply it to live hero.`);
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 text-white shadow-2xl transition-colors duration-200 motion-reduce:transition-none">
      <div className="enterprise-responsive-guard flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Version Control
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            Hero Version Timeline & Restore
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Enterprise checkpoint foundation for restore, compare, draft and publish workflow.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition-colors duration-200 motion-reduce:transition-none">
          Active: {activeVersion.id}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_360px] enterprise-mobile-stack">
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`rounded-2xl border p-4 transition ${
                activeVersion.id === version.id
                  ? "border-cyan-400 bg-cyan-950/35"
                  : "border-white/10 bg-slate-950/55"
              }`}
            >
              <div className="enterprise-responsive-guard flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">
                      {version.id}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-slate-300 transition-colors duration-200 motion-reduce:transition-none">
                      {version.status}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{version.createdAt}</span>
                  </div>

                  <h4 className="mt-3 text-lg font-black">{version.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">{version.note}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    By {version.user}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveVersion(version)}
                    className="rounded-xl border border-white/10 px-4 py-3 text-xs font-black transition-colors duration-200 motion-reduce:transition-none"
                  >
                    Compare
                  </button>
                  <button
                    type="button"
                    onClick={() => restoreVersion(version)}
                    className="rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black text-slate-950"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition-colors duration-200 motion-reduce:transition-none">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-300">
            Snapshot Compare
          </p>
          <h4 className="mt-3 text-xl font-black">{activeVersion.snapshot.headline}</h4>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            {activeVersion.snapshot.subheadline}
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Primary CTA</p>
              <p className="mt-1 font-black">{activeVersion.snapshot.primaryCta}</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">AI Quality Score</p>
              <p className="mt-1 text-3xl font-black">{activeVersion.snapshot.qualityScore}/100</p>
            </div>
          </div>

          {restoreMessage ? (
            <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-200 transition-colors duration-200 motion-reduce:transition-none">
              {restoreMessage}
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
import { resolveAssetUrl } from "@/utils/resolveAssetUrl";

export type HeroStudioHero = {
  id?: string;
  headline?: string;
  subheadline?: string;
  shortDescription?: string;
  longDescription?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  src?: string;
  desktopSrc?: string;
  laptopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  alt?: string;
  altText?: string;
  seoTitle?: string;
  seoDescription?: string;
  sliderEffect?: string;
  cropMode?: string;
  qualityMode?: string;
  sortOrder?: number;
  active?: boolean;
};

type Device = "desktop" | "laptop" | "tablet" | "mobile";
type Tab = "content" | "creative" | "crop" | "ai" | "publish" | "analytics";

type CropState = {
  x: number;
  y: number;
  zoom: number;
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
};

type Props = {
  hero?: HeroStudioHero | null;
  mode?: "create" | "edit";
  onSave?: (payload: HeroStudioHero) => Promise<void> | void;
  onPublish?: (payload: HeroStudioHero) => Promise<void> | void;
  onGenerateAI?: (payload: HeroStudioHero) => Promise<Partial<HeroStudioHero>> | Partial<HeroStudioHero>;
};

const effects = ["cinematic", "ken-burns", "editorial-pan", "saqso-luxury", "zoom", "fade"];
const devices: Record<Device, { label: string; frame: string; size: string }> = {
  desktop: { label: "Desktop", frame: "aspect-[16/9] max-w-6xl", size: "3840 × 2160" },
  laptop: { label: "Laptop", frame: "aspect-[16/9] max-w-5xl", size: "1920 × 1080" },
  tablet: { label: "Tablet", frame: "aspect-[4/3] max-w-3xl", size: "1536 × 1152" },
  mobile: { label: "Mobile", frame: "aspect-[9/16] max-w-sm", size: "1080 × 1440" },
};

const cropDefault = (): CropState => ({ x: 50, y: 50, zoom: 1, boxX: 10, boxY: 10, boxW: 80, boxH: 80 });
const cropMap = () => ({ desktop: cropDefault(), laptop: cropDefault(), tablet: cropDefault(), mobile: cropDefault() });

const emptyHero: HeroStudioHero = {
  headline: "",
  subheadline: "",
  shortDescription: "",
  longDescription: "",
  primaryCtaLabel: "Shop Now",
  primaryCtaLink: "/shop",
  secondaryCtaLabel: "Explore",
  secondaryCtaLink: "/collections",
  src: "",
  desktopSrc: "",
  laptopSrc: "",
  tabletSrc: "",
  mobileSrc: "",
  alt: "",
  altText: "",
  seoTitle: "",
  seoDescription: "",
  sliderEffect: "cinematic",
  cropMode: "SYSTEM",
  qualityMode: "4K",
  sortOrder: 1,
  active: false,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function HeroStudio({
  hero,
  mode = "create",
  onSave,
  onPublish,
  onGenerateAI,
}: Props) {
  const [draft, setDraft] = useState<HeroStudioHero>(emptyHero);
  const [tab, setTab] = useState<Tab>("content");
  const [device, setDevice] = useState<Device>("desktop");
  const [crops, setCrops] = useState<Record<Device, CropState>>(cropMap());
  const [safeZone, setSafeZone] = useState(true);
  const [focusPoint, setFocusPoint] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft({
      ...emptyHero,
      ...hero,
      shortDescription: hero?.shortDescription || hero?.subheadline || "",
      longDescription: hero?.longDescription || hero?.seoDescription || "",
      altText: hero?.altText || hero?.alt || "",
      sortOrder: Number(hero?.sortOrder || 1),
      sliderEffect: hero?.sliderEffect || "cinematic",
      cropMode: hero?.cropMode || "SYSTEM",
      qualityMode: hero?.qualityMode || "4K",
    });
    setCrops(cropMap());
    setTab("content");
  }, [hero?.id]);

  const image = useMemo(
    () =>
      resolveAssetUrl(
        (device === "desktop" && draft.desktopSrc) ||
          (device === "laptop" && draft.laptopSrc) ||
          (device === "tablet" && draft.tabletSrc) ||
          (device === "mobile" && draft.mobileSrc) ||
          draft.desktopSrc ||
          draft.laptopSrc ||
          draft.tabletSrc ||
          draft.mobileSrc ||
          draft.src ||
          ""
      ),
    [draft, device]
  );

  const score = useMemo(() => {
    let value = 40;
    if (draft.headline && draft.headline.length > 8) value += 12;
    if (draft.shortDescription && draft.shortDescription.length > 12) value += 10;
    if (draft.longDescription && draft.longDescription.length > 25) value += 10;
    if (draft.primaryCtaLabel) value += 6;
    if (draft.desktopSrc || draft.src) value += 10;
    if (draft.altText) value += 4;
    if (draft.seoTitle) value += 4;
    if (safeZone) value += 2;
    if (focusPoint) value += 2;
    return Math.min(100, value);
  }, [draft, safeZone, focusPoint]);

  const update = (patch: Partial<HeroStudioHero>) => setDraft((prev) => ({ ...prev, ...patch }));

  const updateCrop = (patch: Partial<CropState>) => {
    setCrops((prev) => ({
      ...prev,
      [device]: { ...prev[device], ...patch },
    }));
  };

  const normalizedPayload = (publish = false): HeroStudioHero => ({
    ...draft,
    subheadline: draft.shortDescription || draft.subheadline || "",
    seoDescription: draft.longDescription || draft.seoDescription || "",
    alt: draft.altText || draft.alt || "",
    active: publish ? true : draft.active,
    sortOrder: Number(draft.sortOrder || 1),
  });

  const save = async (publish = false) => {
    setSaving(true);
    setMessage("");
    try {
      const payload = normalizedPayload(publish);
      if (publish && onPublish) await onPublish(payload);
      else if (onSave) await onSave(payload);
      setMessage(publish ? "Hero published successfully." : "Hero saved successfully.");
    } catch (error: any) {
      setMessage(error?.message || "Hero save failed.");
    } finally {
      setSaving(false);
    }
  };

  const generateAI = async () => {
    setAiLoading(true);
    setMessage("");
    try {
      const fallback: Partial<HeroStudioHero> = {
        headline: draft.headline || "Premium Fashion Collection",
        shortDescription: draft.shortDescription || "Discover premium styles crafted for modern everyday confidence.",
        longDescription: draft.longDescription || "Create a polished shopping experience with responsive hero visuals, clear CTA messaging, and premium brand storytelling.",
        primaryCtaLabel: draft.primaryCtaLabel || "Shop Now",
        secondaryCtaLabel: draft.secondaryCtaLabel || "Explore Collection",
        altText: draft.altText || "Premium fashion hero banner",
        seoTitle: draft.seoTitle || "Premium Fashion Collection",
        seoDescription: draft.seoDescription || "Premium fashion collection hero banner for ecommerce storefront.",
        sliderEffect: draft.sliderEffect || "cinematic",
      };

      const ai = onGenerateAI ? await onGenerateAI(draft) : fallback;
      setDraft((prev) => ({
        ...prev,
        ...fallback,
        ...ai,
        shortDescription: ai.shortDescription || ai.subheadline || fallback.shortDescription || prev.shortDescription,
        longDescription: ai.longDescription || ai.seoDescription || fallback.longDescription || prev.longDescription,
      }));
      setMessage("AI content generated.");
    } catch (error: any) {
      setMessage(error?.message || "AI generate failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const tabs: Tab[] = ["content", "creative", "crop", "ai", "publish", "analytics"];
  const crop = crops[device];

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
        <div className="enterprise-responsive-guard flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between enterprise-mobile-stack">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">
              Enterprise Hero Studio V3 · {mode === "edit" ? "Edit Hero" : "Create Hero"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              AI Creative Workspace
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-white/50">
              Content, crop, safe zone, focus point, AI copy, publish workflow and analytics in one studio.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button type="button"
                key={item}
                onClick={() => setTab(item)}
                className={tab === item ? "rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black capitalize text-white dark:bg-white dark:text-slate-950" : "rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black capitalize dark:border-white/10"}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={generateAI} disabled={aiLoading} className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
              {aiLoading ? "Generating..." : "Generate AI"}
            </button>
            <button type="button" onClick={() => save(false)} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black dark:border-white/10 transition-colors duration-200 motion-reduce:transition-none">
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button type="button" onClick={() => save(true)} disabled={saving} className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">
              Publish
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-700 dark:bg-white/[0.06] dark:text-white/70">
            {message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1fr_390px] enterprise-mobile-stack">
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 enterprise-mobile-stack">
              <div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">Device Preview</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{devices[device].label} · {devices[device].size}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(devices) as Device[]).map((item) => (
                  <button type="button"
                    key={item}
                    onClick={() => setDevice(item)}
                    className={device === item ? "rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950" : "rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black dark:border-white/10"}
                  >
                    {devices[item].label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`relative mx-auto overflow-hidden rounded-[2rem] bg-slate-950 ${devices[device].frame}`}>
              {image ? (
                <img
                  src={image}
                  alt={draft.altText || draft.headline || "Hero"}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    objectPosition: `${crop.x}% ${crop.y}%`,
                    transform: `scale(${crop.zoom})`,
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white/40">No image selected</div>
              )}

              {safeZone ? (
                <div className="pointer-events-none absolute inset-y-[10%] left-[9%] right-[9%] rounded-3xl border-2 border-dashed border-yellow-300 bg-yellow-300/10 transition-colors duration-200 motion-reduce:transition-none">
                  <span className="absolute left-4 top-4 rounded-full bg-yellow-300 px-3 py-1 text-[10px] font-black text-slate-950">SAFE ZONE</span>
                </div>
              ) : null}

              {focusPoint ? (
                <div className="pointer-events-none absolute left-1/2 top-1/3 h-24 w-24 -translate-x-1/2 rounded-full border-4 border-rose-500/80 bg-rose-500/10 transition-colors duration-200 motion-reduce:transition-none">
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-black text-white">FOCUS</span>
                </div>
              ) : null}

              <div
                className="pointer-events-none absolute rounded-2xl border-2 border-cyan-300 bg-cyan-300/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.24)] transition-colors duration-200 motion-reduce:transition-none"
                style={{
                  left: `${crop.boxX}%`,
                  top: `${crop.boxY}%`,
                  width: `${crop.boxW}%`,
                  height: `${crop.boxH}%`,
                }}
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white md:p-8">
                <h1 className="max-w-4xl text-3xl font-black leading-[0.95] md:text-6xl">{draft.headline || "Hero headline"}</h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold text-white/75 md:text-base">
                  {draft.shortDescription || draft.subheadline || "Short description"}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">{draft.primaryCtaLabel || "Shop Now"}</button>
                  <button type="button" className="rounded-full border border-white/50 px-5 py-3 text-sm font-black text-white transition-colors duration-200 motion-reduce:transition-none">{draft.secondaryCtaLabel || "Explore"}</button>
                </div>
              </div>
            </div>
          </div>

          {(tab === "content" || tab === "creative") && (
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Content Studio</h3>
              <div className="mt-5 grid gap-4">
                <input value={draft.headline || ""} onChange={(e) => update({ headline: e.target.value })} placeholder="Headline" className="rounded-2xl border border-slate-200 bg-transparent p-4 text-sm font-bold outline-none dark:border-white/10 transition-colors duration-200 motion-reduce:transition-none" />
                <textarea value={draft.shortDescription || ""} onChange={(e) => update({ shortDescription: e.target.value, subheadline: e.target.value })} placeholder="Short Description" className="min-h-24 rounded-2xl border border-slate-200 bg-transparent p-4 text-sm font-bold outline-none dark:border-white/10 transition-colors duration-200 motion-reduce:transition-none" />
                <textarea value={draft.longDescription || ""} onChange={(e) => update({ longDescription: e.target.value, seoDescription: e.target.value })} placeholder="Long Description" className="min-h-32 rounded-2xl border border-slate-200 bg-transparent p-4 text-sm font-bold outline-none dark:border-white/10 transition-colors duration-200 motion-reduce:transition-none" />
              </div>
            </div>
          )}

          {(tab === "crop" || tab === "creative") && (
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Crop Studio · {devices[device].label}</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2 enterprise-mobile-stack">
                <Range label="Image X" value={crop.x} min={0} max={100} onChange={(v) => updateCrop({ x: v })} />
                <Range label="Image Y" value={crop.y} min={0} max={100} onChange={(v) => updateCrop({ y: v })} />
                <Range label="Zoom" value={crop.zoom} min={1} max={3} step={0.05} onChange={(v) => updateCrop({ zoom: v })} />
                <Range label="Crop X" value={crop.boxX} min={0} max={100} onChange={(v) => updateCrop({ boxX: clamp(v, 0, 100 - crop.boxW) })} />
                <Range label="Crop Y" value={crop.boxY} min={0} max={100} onChange={(v) => updateCrop({ boxY: clamp(v, 0, 100 - crop.boxH) })} />
                <Range label="Crop W" value={crop.boxW} min={20} max={100} onChange={(v) => updateCrop({ boxW: clamp(v, 20, 100 - crop.boxX) })} />
                <Range label="Crop H" value={crop.boxH} min={20} max={100} onChange={(v) => updateCrop({ boxH: clamp(v, 20, 100 - crop.boxY) })} />
              </div>
            </div>
          )}

          {tab === "publish" && (
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Publish Workflow</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-4 enterprise-mobile-stack">
                {["Draft", "Preview", "Publish", "Version"].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-100 p-5 text-sm font-black dark:bg-white/[0.06]">{item}</div>
                ))}
              </div>
            </div>
          )}

          {tab === "analytics" && (
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Hero Analytics</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 enterprise-mobile-stack">
                {["Views: Ready", "CTR: Ready", "Device CTR: Ready", "A/B: Future Ready", "Winner: Pending", `Published: ${draft.active ? "Yes" : "No"}`].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-100 p-5 text-sm font-black dark:bg-white/[0.06]">{item}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Studio Settings</h3>
            <div className="mt-5 space-y-4">
              <Select label="Effect Option" value={draft.sliderEffect || "cinematic"} onChange={(v) => update({ sliderEffect: v })} options={effects} />
              <Input label="Sort Serial" type="number" value={String(draft.sortOrder || 1)} onChange={(v) => update({ sortOrder: Number(v) })} />
              <Select label="Quality Mode" value={draft.qualityMode || "4K"} onChange={(v) => update({ qualityMode: v })} options={["4K", "AUTO", "WEB"]} />
              <Input label="Alt Text" value={draft.altText || ""} onChange={(v) => update({ altText: v, alt: v })} />
              <Input label="Desktop Image URL" value={draft.desktopSrc || ""} onChange={(v) => update({ desktopSrc: v })} />
              <Input label="Laptop Image URL" value={draft.laptopSrc || ""} onChange={(v) => update({ laptopSrc: v })} />
              <Input label="Tablet Image URL" value={draft.tabletSrc || ""} onChange={(v) => update({ tabletSrc: v })} />
              <Input label="Mobile Image URL" value={draft.mobileSrc || ""} onChange={(v) => update({ mobileSrc: v })} />

              <div className="grid gap-2 sm:grid-cols-2 enterprise-mobile-stack">
                <button type="button" onClick={() => setSafeZone((v) => !v)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10 transition-colors duration-200 motion-reduce:transition-none">Safe Zone {safeZone ? "On" : "Off"}</button>
                <button type="button" onClick={() => setFocusPoint((v) => !v)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10 transition-colors duration-200 motion-reduce:transition-none">Focus {focusPoint ? "On" : "Off"}</button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">AI Quality Score</p>
            <p className="mt-4 text-5xl font-black text-slate-950 dark:text-white">{score}/100</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" style={{ width: `${score}%` }} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">AI Recommendations</h3>
            <div className="mt-4 space-y-3">
              {["Keep CTA inside safe zone.", "Use mobile-specific image for best conversion.", "Add alt text for accessibility.", "Check crop on all devices before publish."].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-600 dark:bg-white/[0.06] dark:text-white/60">{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] transition-colors duration-200 motion-reduce:transition-none">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Version Timeline</h3>
            <div className="mt-4 space-y-3">
              {["Draft", "AI Generated", "Preview Checked", "Publish Ready"].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-100 p-4 text-sm font-black dark:bg-white/[0.06]">{item}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
          <HeroVersionTimelinePanel />
</section>
  );
}

function Range({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return (
    <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
      {label}
      <input className="mt-2 w-full" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent p-3 text-sm font-bold normal-case tracking-normal outline-none dark:border-white/10 transition-colors duration-200 motion-reduce:transition-none" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent p-3 text-sm font-bold normal-case tracking-normal outline-none dark:border-white/10 transition-colors duration-200 motion-reduce:transition-none">
        {options.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}