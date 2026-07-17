"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type DeviceKey = "desktop" | "laptop" | "tablet" | "mobile";

type LocalHeroDraft = {
  id: string;
  title: string;
  desktopSrc?: string;
  laptopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  updatedAt?: string;
};

const devices: Array<{ key: DeviceKey; label: string; size: string }> = [
  { key: "desktop", label: "Desktop", size: "3840 Ã— 2160" },
  { key: "laptop", label: "Laptop", size: "2880 Ã— 1800" },
  { key: "tablet", label: "Tablet", size: "2048 Ã— 1536" },
  { key: "mobile", label: "Mobile", size: "1080 Ã— 1920" },
];

const storageKey = "ai-commerce:homepage-hero:device-image-editor";

const initialHeroes: LocalHeroDraft[] = [
  { id: "local-hero-1", title: "Premium Fashion Collection" },
  { id: "local-hero-2", title: "Summer Collection 2026" },
  { id: "local-hero-3", title: "Men Formal Collection" },
];

export default function HeroDeviceImageEditorPanel() {
  const [heroes, setHeroes] = useState<LocalHeroDraft[]>(initialHeroes);
  const [selectedId, setSelectedId] = useState(initialHeroes[0].id);
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as LocalHeroDraft[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHeroes(parsed);
          setSelectedId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

  const selectedHero = useMemo(
    () => heroes.find((item) => item.id === selectedId) || heroes[0],
    [heroes, selectedId]
  );

  const activeImage =
    selectedHero?.[`${device}Src` as keyof LocalHeroDraft] ||
    selectedHero?.desktopSrc ||
    selectedHero?.laptopSrc ||
    selectedHero?.tabletSrc ||
    selectedHero?.mobileSrc;

  const persist = (nextHeroes: LocalHeroDraft[]) => {
    setHeroes(nextHeroes);
    localStorage.setItem(storageKey, JSON.stringify(nextHeroes));
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedHero) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const field = `${device}Src` as keyof LocalHeroDraft;

      const nextHeroes = heroes.map((hero) =>
        hero.id === selectedHero.id
          ? { ...hero, [field]: dataUrl, updatedAt: new Date().toLocaleString() }
          : hero
      );

      persist(nextHeroes);
      setMessage(`${devices.find((item) => item.key === device)?.label} image saved to local storage.`);
    };

    reader.readAsDataURL(file);
  };

  const clearDeviceImage = () => {
    if (!selectedHero) return;
    const field = `${device}Src` as keyof LocalHeroDraft;

    const nextHeroes = heroes.map((hero) => {
      if (hero.id !== selectedHero.id) return hero;
      const clone = { ...hero };
      delete clone[field];
      clone.updatedAt = new Date().toLocaleString();
      return clone;
    });

    persist(nextHeroes);
    setMessage(`${device} image removed from local storage.`);
  };

  const saveDraft = () => {
    persist(heroes.map((hero) => hero.id === selectedHero.id ? { ...hero, updatedAt: new Date().toLocaleString() } : hero));
    setMessage("Existing Created Hero edit draft saved locally.");
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 text-white shadow-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Existing Created Heroes
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            Edit + Device Image Upload
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Upload local images for Desktop, Laptop, Tablet and Mobile. Draft is stored in browser localStorage before server publish integration.
          </p>
        </div>
        <button onClick={saveDraft} className="rounded-2xl bg-amber-300 px-5 py-4 text-sm font-black text-slate-950">
          Save Local Draft
        </button>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Hero Library</p>
          <div className="mt-4 space-y-3">
            {heroes.map((hero) => (
              <button
                key={hero.id}
                onClick={() => setSelectedId(hero.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedId === hero.id ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className="font-black">{hero.title}</p>
                <p className="mt-2 text-xs text-slate-400">{hero.updatedAt || "Not edited yet"}</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {devices.map((item) => (
              <button
                key={item.key}
                onClick={() => setDevice(item.key)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  device === item.key ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className="font-black">{item.label}</p>
                <p className="mt-1 text-xs text-slate-400">{item.size}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950">
              {activeImage ? (
                <img src={String(activeImage)} alt={selectedHero?.title || "Hero preview"} className="h-full min-h-[420px] w-full object-cover" />
              ) : (
                <div className="grid min-h-[420px] place-items-center p-8 text-center">
                  <div>
                    <p className="text-2xl font-black">No {device} image uploaded</p>
                    <p className="mt-3 text-sm text-slate-400">Choose local image from your computer.</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-[8%] rounded-[2rem] border-2 border-dashed border-amber-300/60" />
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Upload Control</p>
              <h4 className="mt-3 text-xl font-black">{selectedHero?.title}</h4>
              <p className="mt-2 text-sm text-slate-400">Active device: {device}</p>

              <label className="mt-5 block cursor-pointer rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-center font-black hover:bg-white/[0.08]">
                Upload {device} Image
                <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
              </label>

              <button onClick={clearDeviceImage} className="mt-3 w-full rounded-2xl border border-rose-400/30 bg-rose-400/10 px-5 py-4 text-sm font-black text-rose-100">
                Remove Device Image
              </button>

              {message ? (
                <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100">
                  {message}
                </p>
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}