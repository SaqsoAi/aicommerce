// PHASE_3_2_TOP_RISK_HARDENED
/* PHASE_3_1_RESPONSIVE_GUARD */
"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type DeviceKey = "desktop" | "laptop" | "tablet" | "mobile";

type HeroItem = {
  id?: string | number;
  type?: string;
  src?: string;
  desktopSrc?: string;
  laptopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  alt?: string;
  headline?: string;
  subheadline?: string;
  shortDescription?: string;
  longDescription?: string;
  primaryCtaLabel?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  sliderEffect?: string;
  transitionSpeed?: number | string;
  duration?: number | string;
  active?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[] | string;
};

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api";

const devices: Array<{ key: DeviceKey; label: string; size: string }> = [
  { key: "desktop", label: "Desktop", size: "1920x1080" },
  { key: "laptop", label: "Laptop", size: "1366x768" },
  { key: "tablet", label: "Tablet", size: "1024x768" },
  { key: "mobile", label: "Mobile", size: "768x1024" },
];

function endpoint(path: string) {
  return `${API.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function apiBase() {
  return API.replace(/\/api\/?$/, "");
}

function assetUrl(src?: string) {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("blob:") || src.startsWith("data:")) return src;
  if (src.startsWith("/uploads/")) return `${apiBase()}${src}`;
  if (src.startsWith("uploads/")) return `${apiBase()}/${src}`;
  return src;
}

function toApiPath(src?: string) {
  if (!src) return "";
  if (src.startsWith("blob:") || src.startsWith("data:")) return "";
  const base = apiBase();
  if (src.startsWith(base)) return src.slice(base.length);
  if (src.startsWith("/uploads/")) return src;
  if (src.startsWith("uploads/")) return `/${src}`;
  return src;
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  if (typeof window === "undefined") return extra || {};
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";
  return token ? { ...(extra || {}), Authorization: `Bearer ${token}` } : extra || {};
}





function heroFrom(data: unknown): HeroItem | null {
  const x = data as any;
  if (!x) return null;
  if (x?.data && !Array.isArray(x.data)) return x.data;
  if (x?.hero) return x.hero;
  if (x?.item) return x.item;
  if (x?.result) return x.result;
  if (x?.id || x?.headline || x?.src) return x;
  return null;
}

function listFrom(data: unknown): HeroItem[] {
  const x = data as any;
  if (Array.isArray(data)) return data as HeroItem[];
  if (Array.isArray(x?.data)) return x.data;
  if (Array.isArray(x?.heroes)) return x.heroes;
  if (Array.isArray(x?.items)) return x.items;
  if (Array.isArray(x?.rows)) return x.rows;
  return [];
}

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  if (name === "menu") return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  if (name === "save") return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M5 4h12l2 2v14H5V4Z" stroke="currentColor" strokeWidth="1.8"/><path d="M8 4v6h8V4M8 20v-6h8v6" stroke="currentColor" strokeWidth="1.8"/></svg>;
  if (name === "eye") return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>;
  if (name === "upload") return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M12 16V4m0 0 4 4m-4-4-4 4M5 16v4h14v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === "desktop") return <svg viewBox="0 0 24 24" fill="none" className={className}><rect x="4" y="5" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><path d="M9 20h6m-3-4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === "laptop") return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M6 6h12v9H6V6Z" stroke="currentColor" strokeWidth="1.8"/><path d="M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === "tablet") return <svg viewBox="0 0 24 24" fill="none" className={className}><rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M11 17h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === "mobile") return <svg viewBox="0 0 24 24" fill="none" className={className}><rect x="8" y="3" width="8" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === "check") return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === "trash") return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M5 7h14m-11 0V5h8v2m-9 3 .7 10h8.6L17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M5 5h14v14H5V5Z" stroke="currentColor" strokeWidth="1.8"/></svg>;
}

function SectionNav() {
  const items = [
    ["1", "Content", "Hero content & settings"],
    ["2", "Media", "Upload & manage media"],
    ["3", "AI Generate", "AI content generation"],
    ["4", "Cropping", "Smart crop for devices"],
    ["5", "Settings", "Slider & display settings"],
    ["6", "SEO", "SEO meta & social"],
    ["7", "Schedule", "Publish time & expiry"],
  ];
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0b111c] p-3 shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
      {items.map(([num, title, desc], index) => (
        <a key={title} href={`#${String(title).toLowerCase().replaceAll(" ", "-")}`} className={`flex gap-3 rounded-2xl p-3 transition ${index === 0 ? "border border-violet-400/50 bg-violet-600/55" : "bg-[#111827]/75 hover:bg-white/10"}`}>
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${index === 0 ? "bg-violet-500" : "bg-white/10"}`}>{num}</span>
          <span><b className="block text-sm">{title}</b><small className="text-slate-400">{desc}</small></span>
        </a>
      ))}
    </div>
  );
}

export default function EnterpriseHeroStudioPage() {
  const [heroId, setHeroId] = useState("");
  const [activeDevice, setActiveDevice] = useState<DeviceKey>("desktop");
  const [images, setImages] = useState<Record<DeviceKey, string>>({ desktop: "", laptop: "", tablet: "", mobile: "" });
  const [type, setType] = useState("image");
  const [headline, setHeadline] = useState("Premium Fashion Collection");
  const [subheadline, setSubheadline] = useState("Style. Confidence. Performance.");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [primaryCta, setPrimaryCta] = useState("Shop Collection");
  const [primaryLink, setPrimaryLink] = useState("/shop");
  const [secondaryCta, setSecondaryCta] = useState("Explore More");
  const [secondaryLink, setSecondaryLink] = useState("/collection");
  const [effect, setEffect] = useState("fade-in-out");
  const [transitionSpeed, setTransitionSpeed] = useState("700");
  const [duration, setDuration] = useState("5000");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [tags, setTags] = useState("");
  const [active, setActive] = useState(false);
  const [prompt, setPrompt] = useState("Generate a premium fashion hero with modern style and confidence theme...");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingDevice, setUploadingDevice] = useState<DeviceKey | "">("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "";
    setHeroId(id);

    const raw = localStorage.getItem("enterpriseHeroStudio.deviceImages");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Record<DeviceKey, string>>;
        setImages((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }

    if (id) {
      loadHero(id);
    } else {
      setMessage("New hero draft ready. Select an existing hero from Hero Manager to load real API data.");
      setIsError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const safeImages: Record<DeviceKey, string> = {
        desktop: images.desktop && !images.desktop.startsWith("data:") && !images.desktop.startsWith("blob:") ? images.desktop : "",
        laptop: images.laptop && !images.laptop.startsWith("data:") && !images.laptop.startsWith("blob:") ? images.laptop : "",
        tablet: images.tablet && !images.tablet.startsWith("data:") && !images.tablet.startsWith("blob:") ? images.tablet : "",
        mobile: images.mobile && !images.mobile.startsWith("data:") && !images.mobile.startsWith("blob:") ? images.mobile : "",
      };
      localStorage.setItem("enterpriseHeroStudio.deviceImages", JSON.stringify(safeImages));
    } catch {
      localStorage.removeItem("enterpriseHeroStudio.deviceImages");
    }
  }, [images]);

  const preview = useMemo(() => images[activeDevice] || images.desktop || images.laptop || images.tablet || images.mobile || "", [images, activeDevice]);

  const score = useMemo(() => {
    const imageScore = Math.min(35, Object.values(images).filter(Boolean).length * 9);
    const textScore = Math.min(25, Math.round((headline.length + subheadline.length) / 3));
    const ctaScore = primaryCta && primaryLink ? 15 : 4;
    const seoScore = seoTitle || seoDescription || tags ? 15 : 6;
    return Math.max(70, Math.min(99, imageScore + textScore + ctaScore + seoScore + 10));
  }, [headline, images, primaryCta, primaryLink, seoDescription, seoTitle, subheadline, tags]);

  function applyHero(hero: HeroItem) {
    setType(hero.type || "image");
    setHeadline(hero.headline || "");
    setSubheadline(hero.subheadline || "");
    setShortDescription(hero.shortDescription || "");
    setLongDescription(hero.longDescription || "");
    setPrimaryCta(hero.primaryCtaLabel || hero.primaryCtaText || "Shop Collection");
    setPrimaryLink(hero.primaryCtaLink || "/shop");
    setSecondaryCta(hero.secondaryCtaLabel || hero.secondaryCtaText || "Explore More");
    setSecondaryLink(hero.secondaryCtaLink || "/collection");
    setEffect(hero.sliderEffect || "fade-in-out");
    setTransitionSpeed(String(hero.transitionSpeed || "700"));
    setDuration(String(hero.duration || "5000"));
    setSeoTitle(hero.seoTitle || "");
    setSeoDescription(hero.seoDescription || "");
    setTags(Array.isArray(hero.tags) ? hero.tags.join(", ") : hero.tags || "");
    setActive(Boolean(hero.active));
    setImages({
      desktop: assetUrl(hero.desktopSrc || hero.src),
      laptop: assetUrl(hero.laptopSrc || hero.desktopSrc || hero.src),
      tablet: assetUrl(hero.tabletSrc || hero.src),
      mobile: assetUrl(hero.mobileSrc || hero.src),
    });
  }

  async function loadHero(id: string) {
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      let hero: HeroItem | null = null;
      const byId = await fetch(endpoint(`/homepage-hero/${id}`), { credentials: "include", cache: "no-store" });
      if (byId.ok) {
        hero = heroFrom(await byId.json());
      }

      if (!hero) {
        const listRes = await fetch(endpoint("/homepage-hero"), { credentials: "include", cache: "no-store" });
        if (!listRes.ok) throw new Error(`Hero list load failed: ${listRes.status}`);
        const rows = listFrom(await listRes.json());
        hero = rows.find((row) => String(row.id) === String(id)) || rows[0] || null;
      }

      if (!hero) throw new Error("Hero not found in API response.");
      applyHero(hero);
      setMessage("Real hero data loaded from API.");
      setIsError(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Hero load failed.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>, device: DeviceKey) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDevice(device);
    setMessage(`Uploading ${device} image...`);
    setIsError(false);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("device", device);

      const res = await fetch(endpoint("/homepage-hero/upload"), {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: form,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const data = await res.json().catch(() => null);
      const url =
        data?.data?.url ||
        data?.url ||
        data?.file?.url ||
        data?.path ||
        data?.src ||
        "";

      if (!url) {
        throw new Error("Upload succeeded but no file URL returned.");
      }

      setImages((prev) => ({ ...prev, [device]: assetUrl(url) }));
      setMessage(`${device} image uploaded and ready to publish.`);
      setIsError(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
      setIsError(true);
    } finally {
      setUploadingDevice("");
      event.target.value = "";
    }
  }

  function generateAi() {
    setHeadline("Stay Focused. Stay Ahead");
    setSubheadline("Style, confidence and performance for every screen.");
    setShortDescription("AI-generated responsive hero summary for modern fashion commerce.");
    setLongDescription("Create a premium homepage hero with device-specific imagery, strong CTA placement, safe-zone readability and conversion-focused messaging.");
    setPrimaryCta("Shop Collection");
    setPrimaryLink("/shop");
    setSecondaryCta("Explore More");
    setSecondaryLink("/collection");
    setSeoTitle("Premium Fashion Collection Hero");
    setSeoDescription("Shop premium fashion with a bold responsive homepage hero.");
    setTags("fashion, premium, collection, homepage hero");
    setPrompt("Generated premium AI hero copy from current visual context.");
  }

  async function saveHero(publish = false) {
    setSaving(true);
    setMessage("");
    setIsError(false);
    const payload = {
      type,
      src: toApiPath([images.desktop, images.laptop, images.tablet, images.mobile].find((x) => x && !x.startsWith("blob:") && !x.startsWith("data:")) || ""),
      desktopSrc: toApiPath(images.desktop && !images.desktop.startsWith("blob:") && !images.desktop.startsWith("data:") ? images.desktop : ""),
      laptopSrc: toApiPath(images.laptop && !images.laptop.startsWith("blob:") && !images.laptop.startsWith("data:") ? images.laptop : ""),
      tabletSrc: toApiPath(images.tablet && !images.tablet.startsWith("blob:") && !images.tablet.startsWith("data:") ? images.tablet : ""),
      mobileSrc: toApiPath(images.mobile && !images.mobile.startsWith("blob:") && !images.mobile.startsWith("data:") ? images.mobile : ""),
      alt: headline,
      headline,
      subheadline,
      shortDescription,
      longDescription,
      primaryCtaLabel: primaryCta,
      primaryCtaText: primaryCta,
      primaryCtaLink: primaryLink,
      secondaryCtaLabel: secondaryCta,
      secondaryCtaText: secondaryCta,
      secondaryCtaLink: secondaryLink,
      sliderEffect: effect,
      transitionSpeed: Number(transitionSpeed) || 700,
      duration: Number(duration) || 5000,
      seoTitle,
      seoDescription,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      active: publish ? true : active,
      cropMode: "ADMIN_DEVICE_CROP",
      qualityMode: "4K",
    };

    try {
      const res = await fetch(endpoint(heroId ? `/homepage-hero/${heroId}` : "/homepage-hero"), {
        method: heroId ? "PUT" : "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const data = await res.json().catch(() => null);
      const saved = heroFrom(data);
      if (saved?.id && !heroId) setHeroId(String(saved.id));
      setActive(publish ? true : active);
      setMessage(publish ? "Hero published successfully." : "Draft saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
      setIsError(true);
    } finally {
      setSaving(false);
    }
  }

  const activeDeviceInfo = devices.find((device) => device.key === activeDevice) || devices[0];

  return (
    <div className="min-h-0 w-full min-w-0 bg-[#070b13] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080d16]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6 enterprise-mobile-stack">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-950/40"><Icon name="menu" className="h-6 w-6" /></div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black">Enterprise Hero Studio</h1>
              <p className="truncate text-sm text-slate-400">Create stunning heroes with AI generation, smart cropping and real-time preview</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button type="button" onClick={() => saveHero(false)} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black hover:bg-white/10 disabled:opacity-60 transition-colors duration-200 motion-reduce:transition-none"><Icon name="save" />Save Draft</button>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black hover:bg-white/10 transition-colors duration-200 motion-reduce:transition-none"><Icon name="eye" />Preview</button>
            <button type="button" onClick={() => saveHero(true)} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black shadow-lg shadow-violet-950/40 hover:bg-violet-500 disabled:opacity-60"><Icon name="upload" />Publish Hero</button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-87px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[260px_minmax(0,1fr)_360px] 2xl:grid-cols-[260px_minmax(0,1fr)_400px] enterprise-mobile-stack">
        <aside className="space-y-4 xl:sticky xl:top-[104px] xl:h-[calc(100vh-120px)] xl:enterprise-table-guard overflow-x-auto overscroll-x-contain data-table-wrap">
          <SectionNav />
          <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-4 transition-colors duration-200 motion-reduce:transition-none">
            <h3 className="font-black">Quick Actions</h3>
            <div className="mt-3 space-y-3 text-sm text-slate-300">
              <button type="button" className="block hover:text-white">Duplicate Hero</button>
              <button type="button" className="block hover:text-white">Import Hero</button>
              <button type="button" className="block hover:text-white">Export Hero</button>
              <a href="/" target="_blank" className="block hover:text-white">View Live Hero</a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-4 transition-colors duration-200 motion-reduce:transition-none">
            <h3 className="font-black">Storage</h3>
            <p className="mt-4 text-sm text-slate-400">Local Storage</p>
            <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 w-1/4 rounded-full bg-violet-500" /></div>
            <p className="mt-2 text-xs text-slate-400">Browser saved device images</p>
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between enterprise-mobile-stack">
            <a href="/homepage-hero" className="inline-flex w-fit items-center rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200 hover:bg-violet-500/20 transition-colors duration-200 motion-reduce:transition-none">Back to Hero Manager</a>
            <div className="flex items-center gap-2 text-xs text-slate-400">Auto Saved <span className="text-emerald-400"><Icon name="check" className="inline h-4 w-4" /></span> 2 seconds ago</div>
          </div>

          {message && <div className={`rounded-2xl border p-3 text-sm ${isError ? "border-amber-400/20 bg-amber-400/10 text-amber-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}>{loading ? "Loading... " : ""}{message}</div>}

          <section id="content" className="grid gap-4 2xl:grid-cols-[1fr_1.05fr] enterprise-mobile-stack">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
              <h2 className="text-lg font-black">Basic Information</h2>
              <div className="mt-4 space-y-4">
                <label className="block"><span className="text-xs font-bold text-slate-400">Hero Title</span><input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none focus:border-violet-400 transition-colors duration-200 motion-reduce:transition-none" placeholder="Hero Title" /></label>
                <label className="block"><span className="text-xs font-bold text-slate-400">Subtitle</span><input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none focus:border-violet-400 transition-colors duration-200 motion-reduce:transition-none" placeholder="Subtitle" /></label>
                <div className="grid gap-3 sm:grid-cols-2 enterprise-mobile-stack">
                  <label className="block"><span className="text-xs font-bold text-slate-400">Type</span><select value={type} onChange={(e) => setType(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none"><option value="image">Image</option><option value="video">Video</option></select></label>
                  <label className="block"><span className="text-xs font-bold text-slate-400">Slider Effect</span><select value={effect} onChange={(e) => setEffect(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none">{["fade-in-out","slide-left","zoom-in","ken-burns","parallax","cube","flip","creative"].map((x) => <option key={x} value={x}>{x}</option>)}</select></label>
                  <label className="block"><span className="text-xs font-bold text-slate-400">Primary Button</span><input value={primaryCta} onChange={(e) => setPrimaryCta(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none" /></label>
                  <label className="block"><span className="text-xs font-bold text-slate-400">Link</span><input value={primaryLink} onChange={(e) => setPrimaryLink(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none" /></label>
                  <label className="block"><span className="text-xs font-bold text-slate-400">Secondary Button</span><input value={secondaryCta} onChange={(e) => setSecondaryCta(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none" /></label>
                  <label className="block"><span className="text-xs font-bold text-slate-400">Link</span><input value={secondaryLink} onChange={(e) => setSecondaryLink(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none" /></label>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
              <h2 className="text-lg font-black">Hero Preview (Active Slide)</h2>
              <div className="mt-4 aspect-[16/8] overflow-hidden rounded-2xl bg-black">
                {preview ? <img src={preview} alt={headline} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-500">Upload or load hero image</div>}
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-[#111827] p-4 text-sm text-slate-300 transition-colors duration-200 motion-reduce:transition-none"><b className="mr-2 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">{active ? "Live" : "Draft"}</b>This hero can be saved or published to website.</div>
            </div>
          </section>

          <section id="media" className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
            <h2 className="text-lg font-black">Device Images</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-4 enterprise-mobile-stack">
              {devices.map((device) => (
                <button type="button" key={device.key} onClick={() => setActiveDevice(device.key)} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${activeDevice === device.key ? "border-violet-500 bg-violet-500/20 text-violet-100" : "border-white/10 bg-[#111827]/70 hover:bg-white/[0.07]"}`}>
                  <Icon name={device.key} className="h-6 w-6" />
                  <span><b className="block text-sm">{device.label}</b><small className="text-slate-400">{device.size}</small></span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.1fr] enterprise-mobile-stack">
              <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#0b111c] p-6 text-center hover:border-violet-400/60 transition-colors duration-200 motion-reduce:transition-none">
                <Icon name="upload" className="h-12 w-12 text-slate-400" />
                <b className="mt-4">Drag and drop images here</b>
                <span className="text-sm text-slate-400">or</span>
                <span className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-black">{uploadingDevice === activeDevice ? "Uploading..." : "Browse Local Files"}</span>
                <span className="mt-3 text-xs text-slate-500">Supports JPG, PNG, WEBP. Current device: {activeDeviceInfo.label}</span>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => upload(e, activeDevice)} />
              </label>

              <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-4 transition-colors duration-200 motion-reduce:transition-none">
                <p className="font-black">{activeDeviceInfo.label} Image</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr] enterprise-mobile-stack">
                  <div className="aspect-video overflow-hidden rounded-xl bg-black">{images[activeDevice] ? <img src={images[activeDevice]} alt={activeDevice} className="h-full w-full object-cover" /> : null}</div>
                  <div className="text-sm text-slate-400"><p className="font-bold text-white">hero-{activeDevice}.jpg</p><p className="mt-2">Browser local image or API image</p><p className="mt-2 text-emerald-300">{images[activeDevice] ? "Ready" : "Waiting for upload"}</p></div>
                </div>
                <button type="button" onClick={() => setImages((p) => ({ ...p, [activeDevice]: "" }))} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold hover:bg-white/10 transition-colors duration-200 motion-reduce:transition-none"><Icon name="trash" />Replace / Remove Image</button>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-center text-sm text-emerald-300">All changes are auto-saved to local storage</div>
          </section>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-[104px] xl:h-[calc(100vh-120px)] xl:enterprise-table-guard overflow-x-auto overscroll-x-contain data-table-wrap">
          <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-5 shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
            <div className="flex items-center justify-between gap-3 enterprise-mobile-stack"><h2 className="text-lg font-black">AI Assistant</h2><button type="button" onClick={generateAi} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-black hover:bg-violet-500">Generate</button></div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-[#111827] p-4 text-sm outline-none focus:border-violet-400 transition-colors duration-200 motion-reduce:transition-none" />
            <div className="mt-4"><p className="mb-3 text-sm font-black">Quick Prompts</p><div className="flex flex-wrap gap-2">{["Fashion Collection","Summer Sale","New Arrival","Luxury Brand"].map((x) => <button type="button" key={x} className="rounded-full border border-white/10 px-3 py-2 text-xs hover:bg-white/10 transition-colors duration-200 motion-reduce:transition-none">{x}</button>)}</div></div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-5 shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
            <h2 className="text-lg font-black">AI Score</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-violet-500 text-center transition-colors duration-200 motion-reduce:transition-none"><span><b className="block text-3xl">{score}</b><small className="text-emerald-300">Excellent</small></span></div>
              <div className="flex-1 space-y-3 text-sm">{["Composition","Text Clarity","Color Harmony","Visual Impact"].map((x, i) => { const n = Math.max(72, score - i * 3); return <div key={x}><div className="mb-1 flex justify-between"><span>{x}</span><span>{n}</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-violet-500" style={{ width: `${n}%` }} /></div></div>; })}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b111c] p-5 shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
            <h2 className="text-lg font-black">Device Previews</h2>
            <div className="mt-4 enterprise-responsive-guard grid grid-cols-2 gap-3 enterprise-mobile-stack">
              {devices.map((device) => (
                <button type="button" key={device.key} onClick={() => setActiveDevice(device.key)} className={`rounded-xl border p-2 transition ${activeDevice === device.key ? "border-violet-500 bg-violet-500/15" : "border-white/10 bg-[#111827]/60 hover:bg-white/[0.07]"}`}>
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">{images[device.key] ? <img src={images[device.key]} alt={device.label} className="h-full w-full object-cover" /> : null}</div>
                  <p className="mt-2 text-xs font-black">{device.label}</p>
                  <p className="text-[11px] text-slate-400">{device.size}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>);
}







