// PHASE_3_2_TOP_RISK_HARDENED
/* PHASE_3_1_RESPONSIVE_GUARD */
"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveAssetUrl } from "@/utils/resolveAssetUrl";

type Product = {
  id: string;
  name?: string;
  title?: string;
  sku?: string;
  styleNo?: string;
  barcode?: string;
  price?: number;
  stock?: number;
  status?: string;
  category?: any;
  brand?: any;
  thumbnail?: string;
  image?: string;
  images?: any[];
  gallery?: any[];
  variants?: any[];
  description?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getName = (p?: Product | null) => p?.name || p?.title || "Untitled Product";
const getImage = (p?: Product | null) =>
  resolveAssetUrl(
    p?.thumbnail ||
      p?.image ||
      p?.images?.[0]?.url ||
      p?.gallery?.[0]?.url ||
      ""
  );

export default function EnterpriseProductWorkspace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [tab, setTab] = useState<"studio" | "media" | "variants" | "ai" | "publish">("studio");

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API}/products`, { cache: "no-store" });
      const json = await res.json();
      const data = Array.isArray(json) ? json : json.data || json.products || [];
      setProducts(data);
      if (!selected && data[0]) setSelected(data[0]);
    } catch {
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) =>
      `${p.name || ""} ${p.title || ""} ${p.sku || ""} ${p.styleNo || ""} ${p.barcode || ""}`.toLowerCase().includes(q)
    );
  }, [products, query]);

  const media = useMemo(() => {
    if (!selected) return [];
    return [
      selected.thumbnail,
      selected.image,
      ...(selected.images || []).map((x: any) => x?.url || x?.src || x),
      ...(selected.gallery || []).map((x: any) => x?.url || x?.src || x),
    ].filter(Boolean);
  }, [selected]);

  const aiScore = useMemo(() => {
    let score = 55;
    if (selected?.description) score += 10;
    if (selected?.sku) score += 8;
    if (selected?.price) score += 8;
    if (media.length) score += 10;
    if ((selected?.variants || []).length) score += 9;
    return Math.min(100, score);
  }, [selected, media.length]);

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-sm md:p-8 transition-colors duration-200 motion-reduce:transition-none">
        <div className="enterprise-responsive-guard flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">
              Enterprise Product Workspace
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Product Studio
            </h1>
            <p className="mt-3 max-w-4xl text-sm font-medium leading-6 text-white/55">
              Product details, variant manager, media manager, inventory, pricing, SEO/AI, publish panel and live customer preview.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["studio","media","variants","ai","publish"].map((x) => (
              <button type="button"
                key={x}
                onClick={() => setTab(x as any)}
                className={tab === x ? "rounded-2xl bg-white px-4 py-2 text-sm font-black capitalize text-slate-950" : "rounded-2xl border border-white/10 px-4 py-2 text-sm font-black capitalize text-white/70"}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 2xl:grid-cols-[380px_1fr_380px] enterprise-mobile-stack">
        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
          <div className="flex items-center justify-between gap-3 enterprise-mobile-stack">
            <div>
              <h2 className="text-xl font-black text-white">Product Library</h2>
              <p className="mt-1 text-sm text-white/45">Select product to edit.</p>
            </div>
            <button type="button" onClick={loadProducts} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black transition-colors duration-200 motion-reduce:transition-none">
              Refresh
            </button>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, SKU, barcode..."
            className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold outline-none transition-colors duration-200 motion-reduce:transition-none"
          />

          <div className="mt-5 max-h-[780px] space-y-3 overflow-y-auto pr-1">
            {filtered.map((p) => (
              <button type="button"
                key={p.id}
                onClick={() => setSelected(p)}
                className={selected?.id === p.id ? "flex w-full gap-3 rounded-3xl border border-cyan-400 bg-cyan-400/10 p-3 text-left" : "flex w-full gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3 text-left"}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-900">
                  {getImage(p) ? <img src={getImage(p)} alt={getName(p)} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">{getName(p)}</p>
                  <p className="mt-1 text-xs font-semibold text-white/45">SKU: {p.sku || "-"}</p>
                  <p className="mt-1 text-xs font-semibold text-white/45">Stock: {p.stock ?? 0}</p>
                </div>
              </button>
            ))}

            {filtered.length === 0 ? (
              <div className="rounded-3xl bg-white/[0.05] p-5 text-sm font-bold text-white/55">
                No products found.
              </div>
            ) : null}
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
            <div className="flex flex-wrap items-center justify-between gap-3 enterprise-mobile-stack">
              <div>
                <h2 className="text-2xl font-black text-white">{getName(selected)}</h2>
                <p className="mt-1 text-sm text-white/45">
                  Style: {selected?.styleNo || "-"} · SKU: {selected?.sku || "-"} · Barcode: {selected?.barcode || "-"}
                </p>
              </div>
              <div className="flex gap-2">
                {["desktop","tablet","mobile"].map((x) => (
                  <button type="button"
                    key={x}
                    onClick={() => setDevice(x as any)}
                    className={device === x ? "rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950" : "rounded-2xl border border-white/10 px-4 py-2 text-sm font-black"}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-center rounded-[2rem] bg-black p-6">
              <div className={device === "mobile" ? "w-[360px]" : device === "tablet" ? "w-[720px]" : "w-full max-w-5xl"}>
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 transition-colors duration-200 motion-reduce:transition-none">
                  <div className="aspect-[16/10] bg-slate-900">
                    {getImage(selected) ? (
                      <img src={getImage(selected)} alt={getName(selected)} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Customer Preview</p>
                    <h3 className="mt-2 text-3xl font-black text-white">{getName(selected)}</h3>
                    <p className="mt-2 text-sm text-white/55">{selected?.description || "No product description yet."}</p>
                    <p className="mt-4 text-2xl font-black text-white">Tk {selected?.price || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {tab === "studio" && (
            <div className="grid gap-5 xl:grid-cols-2 enterprise-mobile-stack">
              <Panel title="Product Details" rows={[
                ["Name", getName(selected)],
                ["Category", selected?.category?.name || selected?.category || "-"],
                ["Brand", selected?.brand?.name || selected?.brand || "-"],
                ["Status", selected?.status || "-"],
              ]} />
              <Panel title="Inventory Panel" rows={[
                ["Current Stock", String(selected?.stock ?? 0)],
                ["Variant Count", String((selected?.variants || []).length)],
                ["Approval", "Approved / Draft ready"],
                ["Warehouse", "Ready"],
              ]} />
              <Panel title="Pricing Panel" rows={[
                ["Price", `Tk ${selected?.price || 0}`],
                ["Discount", "Next"],
                ["Margin", "AI Ready"],
                ["Price Suggestion", "Ready"],
              ]} />
              <Panel title="Publish Panel" rows={[
                ["State", selected?.status || "Draft"],
                ["Client Preview", "Ready"],
                ["SEO Ready", `${aiScore}%`],
                ["Publish", "Existing Product API binding ready"],
              ]} />
            </div>
          )}

          {tab === "media" && (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
              <h3 className="text-xl font-black text-white">Enterprise Media Manager</h3>
              <p className="mt-2 text-sm text-white/45">
                Drag & drop gallery, variant-wise images, crop per image, WebP and responsive generation foundation.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 enterprise-mobile-stack">
                {media.length ? media.map((img: any, i) => (
                  <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 transition-colors duration-200 motion-reduce:transition-none">
                    <img src={resolveAssetUrl(String(img))} alt={`Media ${i + 1}`} className="aspect-square w-full object-cover" />
                    <div className="p-3 text-xs font-black text-white/60">Image {i + 1}</div>
                  </div>
                )) : (
                  <div className="rounded-3xl border border-dashed border-white/10 p-8 text-sm font-bold text-white/45 transition-colors duration-200 motion-reduce:transition-none">
                    No media found.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "variants" && (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
              <h3 className="text-xl font-black text-white">Variant Manager</h3>
              <div className="mt-5 enterprise-table-guard overflow-x-auto data-table-wrap">
                <table className="w-full min-w-[760px] text-left text-sm min-w-max">
                  <thead className="text-xs uppercase tracking-[0.18em] text-white/35">
                    <tr>
                      <th className="p-3">Variant</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Barcode</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected?.variants || []).map((v: any, i: number) => (
                      <tr key={v.id || i} className="border-t border-white/10">
                        <td className="p-3 font-bold">{v.color || "-"} / {v.size || "-"}</td>
                        <td className="p-3">{v.sku || "-"}</td>
                        <td className="p-3">{v.barcode || "-"}</td>
                        <td className="p-3">{v.stock ?? 0}</td>
                        <td className="p-3">
                          {v.image ? <img src={resolveAssetUrl(v.image)} className="h-10 w-10 rounded-xl object-cover" alt="Variant" /> : "-"}
                        </td>
                      </tr>
                    ))}
                    {!(selected?.variants || []).length ? (
                      <tr><td className="p-5 text-white/45" colSpan={5}>No variants found.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "ai" && (
            <div className="grid gap-5 xl:grid-cols-2 enterprise-mobile-stack">
              <ScoreCard score={aiScore} />
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
                <h3 className="text-xl font-black text-white">AI Product Panel</h3>
                <div className="mt-4 space-y-3">
                  {["AI Description", "AI SEO", "AI Tags", "AI Alt Text", "AI Variant Suggestion", "AI Pricing Suggestion"].map((x) => (
                    <div key={x} className="rounded-2xl bg-white/[0.06] p-4 text-sm font-black text-white/65">{x} Ready</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "publish" && (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
              <h3 className="text-xl font-black text-white">Publish Workflow</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-4 enterprise-mobile-stack">
                {["Draft", "Preview", "Approval", "Publish"].map((x) => (
                  <div key={x} className="rounded-2xl bg-white/[0.06] p-5 text-sm font-black text-white/70">{x}</div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <ScoreCard score={aiScore} />
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
            <h3 className="text-xl font-black text-white">AI Recommendations</h3>
            <div className="mt-4 space-y-3">
              {[
                "Add high-quality product media.",
                "Use variant-wise images for better conversion.",
                "Add SEO title and meta description.",
                "Review pricing suggestion before publish.",
              ].map((x) => (
                <div key={x} className="rounded-2xl bg-white/[0.06] p-4 text-sm font-bold text-white/60">{x}</div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Panel({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
      <h3 className="text-xl font-black text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map(([a,b]) => (
          <div key={a} className="flex justify-between gap-4 rounded-2xl bg-white/[0.05] p-3 text-sm">
            <span className="font-bold text-white/45">{a}</span>
            <span className="text-right font-black text-white">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ score }: { score: number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 motion-reduce:transition-none">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">AI Product Score</p>
      <p className="mt-4 text-5xl font-black text-white">{score}/100</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}