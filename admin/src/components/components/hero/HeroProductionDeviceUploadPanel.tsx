"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type DeviceKey = "desktop" | "laptop" | "tablet" | "mobile";

type HomepageHero = {
  id: string;
  headline?: string;
  title?: string;
  src?: string;
  desktopSrc?: string;
  laptopSrc?: string;
  tabletSrc?: string;
  mobileSrc?: string;
  active?: boolean;
};

const devices: Array<{ key: DeviceKey; label: string; size: string; field: keyof HomepageHero }> = [
  { key: "desktop", label: "Desktop", size: "3840 Ã— 2160", field: "desktopSrc" },
  { key: "laptop", label: "Laptop", size: "2880 Ã— 1800", field: "laptopSrc" },
  { key: "tablet", label: "Tablet", size: "2048 Ã— 1536", field: "tabletSrc" },
  { key: "mobile", label: "Mobile", size: "1080 Ã— 1920", field: "mobileSrc" },
];

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("image", file);

  const endpoints = [
    `${apiBase()}/homepage-hero/upload`,
    `${apiBase()}/upload`,
    `${apiBase()}/uploads`,
    `${apiBase()}/media/upload`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      if (!res.ok) continue;

      const data = await res.json();
      return (
        data.url ||
        data.src ||
        data.path ||
        data.fileUrl ||
        data.data?.url ||
        data.data?.src ||
        data.data?.path
      );
    } catch {}
  }

  throw new Error("No existing upload endpoint accepted this image.");
}

async function updateHeroDeviceImage(heroId: string, field: keyof HomepageHero, url: string | null) {
  const res = await fetch(`${apiBase()}/homepage-hero/${heroId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ [field]: url }),
  });

  if (!res.ok) {
    throw new Error(`Hero update failed: ${res.status}`);
  }

  return res.json();
}

export default function HeroProductionDeviceUploadPanel() {
  const [heroes, setHeroes] = useState<HomepageHero[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selectedHero = useMemo(
    () => heroes.find((hero) => hero.id === selectedId) || heroes[0],
    [heroes, selectedId]
  );

  const activeDevice = devices.find((item) => item.key === device) || devices[0];
  const activeImage = selectedHero?.[activeDevice.field] || selectedHero?.src || "";

  const loadHeroes = async () => {
    const res = await fetch(`${apiBase()}/homepage-hero`, { credentials: "include" });
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.data || data.heroes || [];
    setHeroes(list);
    if (list.length && !selectedId) setSelectedId(list[0].id);
  };

  useEffect(() => {
    loadHeroes().catch(() => setMessage("Could not load existing heroes."));
  }, []);

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedHero) return;

    setBusy(true);
    setMessage(`Uploading ${activeDevice.label} image...`);

    try {
      const url = await uploadImage(file);
      await updateHeroDeviceImage(selectedHero.id, activeDevice.field, url);
      await loadHeroes();
      setMessage(`${activeDevice.label} image uploaded and saved to database.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const removeImage = async () => {
    if (!selectedHero) return;
    setBusy(true);

    try {
      await updateHeroDeviceImage(selectedHero.id, activeDevice.field, null);
      await loadHeroes();
      setMessage(`${activeDevice.label} image removed from hero.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Remove failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 text-white shadow-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
            Production Upload Engine
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            Existing Hero Edit + Device Image Upload
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Upload, replace and remove Desktop, Laptop, Tablet and Mobile hero images using existing upload and homepage hero APIs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadHeroes()}
          className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-black"
        >
          Refresh Heroes
        </button>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            Existing Created Heroes
          </p>

          <div className="mt-4 space-y-3">
            {heroes.map((hero) => (
              <button
                key={hero.id}
                type="button"
                onClick={() => setSelectedId(hero.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedHero?.id === hero.id
                    ? "border-emerald-300 bg-emerald-300/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className="font-black">{hero.headline || hero.title || hero.id}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {hero.active ? "Active" : "Draft/Inactive"}
                </p>
              </button>
            ))}

            {!heroes.length ? (
              <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
                No heroes loaded from API.
              </p>
            ) : null}
          </div>
        </aside>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {devices.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setDevice(item.key)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  device === item.key
                    ? "border-cyan-300 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.03]"
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
                <img
                  src={String(activeImage)}
                  alt={selectedHero?.headline || "Hero preview"}
                  className="h-full min-h-[420px] w-full object-cover"
                />
              ) : (
                <div className="grid min-h-[420px] place-items-center p-8 text-center">
                  <div>
                    <p className="text-2xl font-black">No {activeDevice.label} image</p>
                    <p className="mt-3 text-sm text-slate-400">
                      Upload a production image for this device.
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-[8%] rounded-[2rem] border-2 border-dashed border-cyan-300/60" />
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Upload Control
              </p>
              <h4 className="mt-3 text-xl font-black">
                {selectedHero?.headline || selectedHero?.title || "Select a hero"}
              </h4>
              <p className="mt-2 text-sm text-slate-400">
                Active device: {activeDevice.label}
              </p>

              <label className="mt-5 block cursor-pointer rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-center font-black hover:bg-white/[0.08]">
                {busy ? "Uploading..." : `Upload ${activeDevice.label} Image`}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                  disabled={busy || !selectedHero}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={removeImage}
                disabled={busy || !selectedHero}
                className="mt-3 w-full rounded-2xl border border-rose-400/30 bg-rose-400/10 px-5 py-4 text-sm font-black text-rose-100 disabled:opacity-50"
              >
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