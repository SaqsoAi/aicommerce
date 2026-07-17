// PHASE_3_2_TOP_RISK_HARDENED
/* PHASE_3_1_RESPONSIVE_GUARD */
"use client";

import { useEffect, useMemo, useState } from "react";

type HeroItem = {
  id?: string | number;
  type?: "image" | "video" | string;
  src?: string;
  desktopSrc?: string;
  laptopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  alt?: string;
  headline?: string;
  subheadline?: string;
  sliderEffect?: string;
  active?: boolean;
  sortOrder?: number;
  views?: number;
  clicks?: number;
  createdAt?: string;
  updatedAt?: string;
};

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api";

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
  if (name === "desktop") {
    return <svg viewBox="0 0 24 24" fill="none" className={className}><rect x="4" y="5" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><path d="M9 20h6m-3-4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  }
  if (name === "laptop") {
    return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M6 6h12v9H6V6Z" stroke="currentColor" strokeWidth="1.8"/><path d="M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  }
  if (name === "tablet") {
    return <svg viewBox="0 0 24 24" fill="none" className={className}><rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M11 17h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  }
  if (name === "mobile") {
    return <svg viewBox="0 0 24 24" fill="none" className={className}><rect x="8" y="3" width="8" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  }
  if (name === "edit") {
    return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.8"/><path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth="1.8"/></svg>;
  }
  if (name === "eye") {
    return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>;
  }
  if (name === "trash") {
    return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M5 7h14m-11 0V5h8v2m-9 3 .7 10h8.6L17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M5 5h14v14H5V5Z" stroke="currentColor" strokeWidth="1.8"/></svg>;
}

function DeviceIcon({ label, ready }: { label: string; ready: boolean }) {
  const key = label.toLowerCase();
  return <Icon name={key} className={`h-5 w-5 ${ready ? "text-emerald-300" : "text-slate-500"}`} />;
}

export default function HomepageHeroManagerPage() {
  const [heroes, setHeroes] = useState<HeroItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadHeroes() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(endpoint("/homepage-hero"), { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error(`Hero load failed: ${res.status}`);
      const data = await res.json();
      const rows = listFrom(data);
      setHeroes(rows);
      if (!selectedId && rows[0]?.id) setSelectedId(String(rows[0].id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load heroes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHeroes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = heroes.length;
    const active = heroes.filter((h) => h.active).length;
    const draft = heroes.filter((h) => !h.active).length;
    const devicesReady = heroes.reduce((sum, h) => sum + [h.desktopSrc || h.src, h.laptopSrc, h.tabletSrc, h.mobileSrc].filter(Boolean).length, 0);
    return { total, active, draft, devicesReady };
  }, [heroes]);

  const filtered = useMemo(() => {
    return heroes
      .filter((h) => {
        const text = `${h.headline || ""} ${h.subheadline || ""} ${h.alt || ""}`.toLowerCase();
        const okQuery = text.includes(query.toLowerCase());
        const okStatus = status === "all" || (status === "live" ? h.active : !h.active);
        const okType = type === "all" || String(h.type || "image").toLowerCase() === type;
        return okQuery && okStatus && okType;
      })
      .sort((a, b) => {
        if (sort === "title") return String(a.headline || "").localeCompare(String(b.headline || ""));
        if (sort === "views") return Number(b.views || 0) - Number(a.views || 0);
        return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
      });
  }, [heroes, query, status, type, sort]);

  const selected = filtered.find((h) => String(h.id) === selectedId) || filtered[0] || heroes[0];

  async function toggleHero(hero: HeroItem) {
    if (!hero.id) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint(`/homepage-hero/${hero.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...hero, active: !hero.active }),
      });
      if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
      await loadHeroes();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status update failed.");
    } finally {
      setLoading(false);
    }
  }

  async function duplicateHero(hero: HeroItem) {
    setLoading(true);
    try {
      const payload = { ...hero, id: undefined, headline: `${hero.headline || "Hero"} Copy`, active: false };
      const res = await fetch(endpoint("/homepage-hero"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Duplicate failed: ${res.status}`);
      await loadHeroes();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Duplicate failed.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteHero(hero: HeroItem) {
    if (!hero.id || !confirm(`Delete ${hero.headline || "hero"}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint(`/homepage-hero/${hero.id}`), { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      await loadHeroes();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  const devices = (hero?: HeroItem): Array<[string, string | undefined, string]> => [
    ["Desktop", hero?.desktopSrc || hero?.src, "1920x1080"],
    ["Laptop", hero?.laptopSrc || hero?.desktopSrc || hero?.src, "1366x768"],
    ["Tablet", hero?.tabletSrc || hero?.src, "1024x768"],
    ["Mobile", hero?.mobileSrc || hero?.src, "768x1024"],
  ];

  const preview = assetUrl(selected?.desktopSrc || selected?.src);

  return (
    <div className="min-h-0 w-full min-w-0 overflow-x-hidden bg-[#060913] text-white">
      <div className="mx-auto max-w-[1800px] p-4 sm:p-5 lg:p-6">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between enterprise-mobile-stack">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">Website Studio</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Homepage Hero</h1>
            <p className="mt-1 text-sm text-slate-400">Manage homepage hero banners with real data, device images and publish control.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={loadHeroes} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold hover:bg-white/10 transition-colors duration-200 motion-reduce:transition-none">Refresh</button>
            <a href="/enterprise-hero-studio" className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-black text-white shadow-lg shadow-violet-950/30 hover:bg-violet-500">Add New Hero</a>
          </div>
        </div>

        <div className="grid gap-5 2xl:grid-cols-[1fr_430px] enterprise-mobile-stack">
          <div className="min-w-0 space-y-5">
            <section className="grid gap-4 md:grid-cols-4 enterprise-mobile-stack">
              {[
                ["Total Heroes", stats.total, "All created slides"],
                ["Active", stats.active, "Published on website"],
                ["Draft", stats.draft, "Saved but hidden"],
                ["Device Assets", stats.devicesReady, "Ready image slots"],
              ].map(([label, value, hint]) => (
                <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
                  <p className="text-sm font-bold text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-black">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{hint}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors duration-200 motion-reduce:transition-none">
              <div className="grid gap-3 lg:grid-cols-[1fr_170px_170px_170px] enterprise-mobile-stack">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hero by title, subtitle..." className="rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none focus:border-violet-400 transition-colors duration-200 motion-reduce:transition-none" />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none">
                  <option value="all">All Status</option>
                  <option value="live">Live</option>
                  <option value="draft">Draft</option>
                </select>
                <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none">
                  <option value="all">All Types</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm outline-none transition-colors duration-200 motion-reduce:transition-none">
                  <option value="newest">Sort: Newest</option>
                  <option value="title">Sort: Title</option>
                  <option value="views">Sort: Views</option>
                </select>
              </div>
            </section>

            {message && <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200 transition-colors duration-200 motion-reduce:transition-none">{message}</div>}

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
              <div className="enterprise-table-guard overflow-x-auto data-table-wrap">
                <table className="w-full min-w-[760px] text-left text-sm lg:min-w-[900px] min-w-max">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.14em] text-slate-400">
                    <tr>
                      <th className="px-4 py-4">Preview</th>
                      <th className="px-4 py-4">Title</th>
                      <th className="px-4 py-4">Type</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Devices</th>
                      <th className="px-4 py-4">Slider Effect</th>
                      <th className="px-4 py-4">Updated</th>
                      <th className="px-4 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((hero) => {
                      const img = assetUrl(hero.desktopSrc || hero.src);
                      const isSelected = String(hero.id || "") === String(selected?.id || "");
                      return (
                        <tr key={String(hero.id || hero.headline)} onClick={() => setSelectedId(String(hero.id || ""))} className={`cursor-pointer border-b border-white/10 transition hover:bg-white/[0.05] ${isSelected ? "bg-violet-500/10" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="h-16 w-32 overflow-hidden rounded-xl bg-white/10">
                              {img ? <img src={img} alt={hero.alt || hero.headline || "hero"} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-black/30" />}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-black">{hero.headline || "Untitled Hero"}</p>
                            <p className="mt-1 line-clamp-1 text-xs text-slate-400">{hero.subheadline || hero.alt || "-"}</p>
                          </td>
                          <td className="px-4 py-3 capitalize">{hero.type || "image"}</td>
                          <td className="px-4 py-3">
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleHero(hero); }} className={`rounded-lg px-3 py-1 text-xs font-black ${hero.active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/20 text-slate-300"}`}>{hero.active ? "Live" : "Draft"}</button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 text-slate-400">
                              {devices(hero).map(([d, src]) => <DeviceIcon key={d} label={d} ready={Boolean(src)} />)}
                            </div>
                          </td>
                          <td className="px-4 py-3">{hero.sliderEffect || "fade-in-out"}</td>
                          <td className="px-4 py-3 text-slate-400">{hero.updatedAt ? new Date(hero.updatedAt).toLocaleDateString() : "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <a href={`/enterprise-hero-studio?id=${encodeURIComponent(String(hero.id || ""))}`} onClick={(e) => e.stopPropagation()} className="rounded-lg bg-white/10 p-2 text-slate-200 hover:bg-violet-600"><Icon name="edit" /></a>
                              <a href={img || "#"} target="_blank" onClick={(e) => e.stopPropagation()} className="rounded-lg bg-white/10 p-2 text-slate-200 hover:bg-white/20"><Icon name="eye" /></a>
                              <button type="button" onClick={(e) => { e.stopPropagation(); duplicateHero(hero); }} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/20">Copy</button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); deleteHero(hero); }} className="rounded-lg bg-red-500/15 p-2 text-red-300 hover:bg-red-500/25"><Icon name="trash" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!filtered.length && (
                      <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-400">{loading ? "Loading heroes..." : "No heroes found."}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm text-slate-400 enterprise-mobile-stack">
                <span>Showing {filtered.length ? 1 : 0} to {filtered.length} of {heroes.length} heroes</span>
                <span>{loading ? "Syncing..." : "Real API data"}</span>
              </div>
            </section>
          </div>

          <aside className="min-w-0 max-w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition-colors duration-200 motion-reduce:transition-none">
            <div className="mb-4 flex items-center justify-between enterprise-mobile-stack">
              <h2 className="text-xl font-black">Hero Details</h2>
              <span className={`rounded-lg px-3 py-1 text-xs font-black ${selected?.active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/20 text-slate-300"}`}>{selected?.active ? "Live" : "Draft"}</span>
            </div>
            <div className="aspect-[16/7] overflow-hidden rounded-2xl bg-white/10">
              {preview ? <img src={preview} alt={selected?.alt || selected?.headline || "hero"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-500">No preview image</div>}
            </div>

            <dl className="mt-5 enterprise-responsive-guard grid grid-cols-[110px_1fr] gap-3 text-sm enterprise-mobile-stack">
              <dt className="text-slate-400">Title</dt><dd>{selected?.headline || "-"}</dd>
              <dt className="text-slate-400">Subtitle</dt><dd>{selected?.subheadline || "-"}</dd>
              <dt className="text-slate-400">Type</dt><dd className="capitalize">{selected?.type || "image"}</dd>
              <dt className="text-slate-400">Effect</dt><dd>{selected?.sliderEffect || "fade-in-out"}</dd>
              <dt className="text-slate-400">Created</dt><dd>{selected?.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}</dd>
              <dt className="text-slate-400">Updated</dt><dd>{selected?.updatedAt ? new Date(selected.updatedAt).toLocaleString() : "-"}</dd>
            </dl>

            <h3 className="mt-6 text-sm font-black">Device Images</h3>
            <div className="mt-3 enterprise-responsive-guard grid grid-cols-2 gap-3 enterprise-mobile-stack">
              {devices(selected).map(([label, src, size]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-2 transition-colors duration-200 motion-reduce:transition-none">
                  <div className="aspect-video overflow-hidden rounded-lg bg-white/10">
                    {src ? <img src={assetUrl(src)} alt={label} className="h-full w-full object-cover" /> : null}
                  </div>
                  <p className="mt-2 text-center text-xs font-black">{label}</p>
                  <p className="text-center text-[11px] text-slate-400">{size}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-6 text-sm font-black">Performance</h3>
            <div className="mt-3 enterprise-responsive-guard grid grid-cols-3 gap-3 enterprise-mobile-stack">
              <div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-400">Views</p><p className="mt-2 text-xl font-black">{selected?.views || 0}</p></div>
              <div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-400">Clicks</p><p className="mt-2 text-xl font-black">{selected?.clicks || 0}</p></div>
              <div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-400">CTR</p><p className="mt-2 text-xl font-black">{selected?.views ? `${Math.round(((selected?.clicks || 0) / selected.views) * 100)}%` : "0%"}</p></div>
            </div>
          </aside>
        </div>
      </div>
    </div>);
}



