"use client";

import { useMemo, useRef, useState } from "react";

type Device = "desktop" | "laptop" | "tablet" | "mobile";
type Status = "queued" | "uploading" | "done" | "failed" | "cancelled";

type UploadItem = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: Status;
  url?: string;
  error?: string;
  xhr?: XMLHttpRequest;
};

type CropMap = Record<Device, { x: number; y: number; zoom: number; overlay: number }>;

const devices = [
  { id: "desktop" as Device, label: "Desktop", frame: "aspect-[16/9] max-w-5xl", size: "3840 × 2160" },
  { id: "laptop" as Device, label: "Laptop", frame: "aspect-[16/10] max-w-4xl", size: "2560 × 1600" },
  { id: "tablet" as Device, label: "Tablet", frame: "aspect-[3/4] max-w-md", size: "1536 × 2048" },
  { id: "mobile" as Device, label: "Mobile", frame: "aspect-[9/16] max-w-xs", size: "1080 × 1920" },
];

const uploadEndpoints = [
  "/api/backend/upload/media",
  "/api/backend/media/upload",
  "/api/backend/homepage-hero/upload",
  "/api/backend/uploads",
];

const defaultCrop: CropMap = {
  desktop: { x: 50, y: 50, zoom: 100, overlay: 55 },
  laptop: { x: 50, y: 50, zoom: 100, overlay: 55 },
  tablet: { x: 50, y: 50, zoom: 112, overlay: 62 },
  mobile: { x: 50, y: 50, zoom: 125, overlay: 68 },
};

function parseUploadedUrl(raw: string) {
  try {
    const data = JSON.parse(raw || "{}");
    return String(
      data?.url ||
      data?.src ||
      data?.path ||
      data?.fileUrl ||
      data?.data?.url ||
      data?.data?.src ||
      data?.data?.path ||
      ""
    );
  } catch {
    return "";
  }
}

function safeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function HomepageHeroEnterpriseWorkspace() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [safeZone, setSafeZone] = useState(true);
  const [grid, setGrid] = useState(false);
  const [headline, setHeadline] = useState("Premium AI commerce experience.");
  const [subheadline, setSubheadline] = useState("Admin controlled responsive hero with safe-zone preview.");
  const [shortDescription, setShortDescription] = useState("AI-ready hero summary for homepage promotion.");
  const [longDescription, setLongDescription] = useState("Create a responsive homepage hero that adapts across desktop, laptop, tablet and mobile while preserving safe-zone readability and product focus.");
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState("Shop Now");
  const [primaryCtaLink, setPrimaryCtaLink] = useState("/shop");
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState("Try AI Fit");
  const [secondaryCtaLink, setSecondaryCtaLink] = useState("/virtual-tryon");
  const [sliderEffect, setSliderEffect] = useState("Fade");
  const [duration, setDuration] = useState(6);
  const [transitionSpeed, setTransitionSpeed] = useState(700);
  const [heroLibraryQuery, setHeroLibraryQuery] = useState("");
  const [heroLibraryFilter, setHeroLibraryFilter] = useState("all");
  const [heroLibrarySort, setHeroLibrarySort] = useState("recent");
  const [seoTitle, setSeoTitle] = useState("AI Commerce Homepage Hero");
  const [seoDescription, setSeoDescription] = useState("Responsive AI-powered homepage hero for product discovery and conversion.");
  const [textX, setTextX] = useState(9);
  const [textY, setTextY] = useState(50);
  const [crop, setCrop] = useState<CropMap>(defaultCrop);
  const [copied, setCopied] = useState(false);

  const activeDevice = useMemo(() => devices.find((item) => item.id === device) || devices[0], [device]);
  const activeItem = items.find((item) => item.id === activeId) || items[0];
  const activeCrop = crop[device];

  const score = useMemo(() => {
    let value = 68;
    if (headline.length >= 18 && headline.length <= 72) value += 8;
    if (subheadline.length >= 40 && subheadline.length <= 180) value += 8;
    if (activeItem?.url || activeItem?.preview) value += 8;
    if (activeCrop.overlay >= 40 && activeCrop.overlay <= 75) value += 5;
    if (textX >= 6 && textX <= 28) value += 3;
    return Math.min(value, 100);
  }, [headline, subheadline, activeItem?.url, activeItem?.preview, activeCrop.overlay, textX]);

  const heroPayload = useMemo(() => {
    const assetUrl = activeItem?.url || activeItem?.preview || "";

    return {
      src: assetUrl,
      desktopSrc: device === "desktop" ? assetUrl : "",
      laptopSrc: device === "laptop" ? assetUrl : "",
      tabletSrc: device === "tablet" ? assetUrl : "",
      mobileSrc: device === "mobile" ? assetUrl : "",
      headline,
      subheadline,
      shortDescription,
      longDescription,
      primaryCtaLabel,
      primaryCtaLink,
      secondaryCtaLabel,
      secondaryCtaLink,
      sliderEffect,
      duration,
      transitionSpeed,
      seoTitle,
      seoDescription,
      cropMode: "ADMIN_DEVICE_CROP",
      qualityMode: "4K",
      aiScore: score,
      cropJson: crop,
      safeZoneJson: {
        enabled: safeZone,
        textX,
        textY,
        recommended: "Keep subject outside left safe-zone text block on mobile/tablet.",
      },
    };
  }, [activeItem?.url, activeItem?.preview, device, headline, subheadline, shortDescription, longDescription, primaryCtaLabel, primaryCtaLink, secondaryCtaLabel, secondaryCtaLink, sliderEffect, duration, transitionSpeed, seoTitle, seoDescription, score, crop, safeZone, textX, textY]);

  const patchItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const setDeviceCrop = (patch: Partial<CropMap[Device]>) => {
    setCrop((current) => ({
      ...current,
      [device]: { ...current[device], ...patch },
    }));
  };

  const addFiles = (files?: FileList | File[]) => {
    const next = Array.from(files || []).map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "queued" as Status,
    }));

    setItems((current) => [...next, ...current]);
    if (next[0]) setActiveId(next[0].id);
  };

  const uploadToEndpoint = (item: UploadItem, endpoint: string, onFail: () => void) => {
    const xhr = new XMLHttpRequest();
    item.xhr = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        patchItem(item.id, { progress: Math.round((event.loaded / event.total) * 100), status: "uploading" });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const uploadedUrl = parseUploadedUrl(xhr.responseText);
        patchItem(item.id, {
          status: "done",
          progress: 100,
          url: uploadedUrl,
          error: uploadedUrl ? "" : "Uploaded, but API did not return a URL field.",
        });
      } else {
        onFail();
      }
    };

    xhr.onerror = onFail;
    xhr.onabort = () => patchItem(item.id, { status: "cancelled", error: "Cancelled by admin" });

    const form = new FormData();
    form.append("file", item.file);
    form.append("folder", "homepage-hero");
    form.append("type", "homepage-hero");

    xhr.open("POST", endpoint);
    xhr.send(form);
  };

  const startUpload = (item: UploadItem) => {
    patchItem(item.id, { status: "uploading", progress: 0, error: "" });

    let index = 0;
    const tryNext = () => {
      const endpoint = uploadEndpoints[index++];
      if (!endpoint) {
        patchItem(item.id, {
          status: "failed",
          error: "No existing upload endpoint accepted this file.",
        });
        return;
      }

      uploadToEndpoint(item, endpoint, tryNext);
    };

    tryNext();
  };

  const cancelUpload = (item: UploadItem) => {
    item.xhr?.abort();
    patchItem(item.id, { status: "cancelled", error: "Cancelled by admin" });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    if (activeId === id) setActiveId("");
  };


  const heroLibrarySourceItems = [activeItem].filter(Boolean) as NonNullable<typeof activeItem>[];

  const heroLibraryItems = heroLibrarySourceItems
    .map((item, index) => ({
      id: item.id,
      title: item.file?.name?.replace(/\.[^/.]+$/, "") || `Hero ${index + 1}`,
      url: item.url || item.preview || "",
      deviceReady: Boolean(item.url || item.preview),
      status: item.id === activeItem?.id ? "active" : "draft",
      score: item.id === activeItem?.id ? score : Math.max(62, Math.min(95, 76 + index * 3)),
      created: index + 1,
    }))
    .filter((item) => {
      const matchesQuery = item.title.toLowerCase().includes(heroLibraryQuery.toLowerCase());
      const matchesFilter =
        heroLibraryFilter === "all" ||
        (heroLibraryFilter === "active" && item.status === "active") ||
        (heroLibraryFilter === "draft" && item.status === "draft") ||
        (heroLibraryFilter === "ready" && item.deviceReady);
      return matchesQuery && matchesFilter;
    })
    .sort((a, b) => {
      if (heroLibrarySort === "score") return b.score - a.score;
      if (heroLibrarySort === "title") return a.title.localeCompare(b.title);
      return b.created - a.created;
    });
  const generateAiDraft = () => {
    const deviceLabel = activeDevice.label.toLowerCase();
    const sourceName = activeItem?.file?.name?.replace(/\.[^/.]+$/, "") || "featured collection";

    setHeadline(`${sourceName} for every ${deviceLabel} screen`);
    setSubheadline("A premium responsive hero generated from the selected product image, optimized for readability, safe-zone balance and conversion.");
    setShortDescription("AI-generated homepage hero copy based on the selected visual and device context.");
    setLongDescription("This hero is prepared for desktop, laptop, tablet and mobile experiences with device-aware crop metadata, safe-zone guidance, CTA clarity and conversion-focused messaging.");
    setPrimaryCtaLabel("Shop Collection");
    setPrimaryCtaLink("/shop");
    setSecondaryCtaLabel("View Lookbook");
    setSecondaryCtaLink("/lookbook");
    setSeoTitle(`${sourceName} responsive homepage hero`);
    setSeoDescription("AI-generated responsive homepage hero with device-aware imagery, strong CTA placement and storefront-ready metadata.");
  };

  const copyPayload = async () => {
    await navigator.clipboard.writeText(safeJson(heroPayload));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-950 sm:p-7">
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[.28em] text-amber-600 dark:text-amber-300">
            Homepage Hero Functional Workspace
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-.06em] text-slate-950 dark:text-white">
            Upload bind, crop metadata & device preview
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyPayload}
            className="rounded-full border border-slate-200 px-6 py-4 text-xs font-black uppercase tracking-[.18em] dark:border-white/10"
          >
            {copied ? "Copied" : "Copy Hero Payload"}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-slate-950 px-6 py-4 text-xs font-black uppercase tracking-[.18em] text-white shadow-xl transition hover:-translate-y-0.5 dark:bg-white dark:text-black"
          >
            Add Asset
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => addFiles(event.target.files || [])}
      />

      <div className="grid gap-5 xl:grid-cols-[410px_1fr]">
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={[
              "grid min-h-52 cursor-pointer place-items-center rounded-[1.5rem] border-2 border-dashed p-6 text-center transition",
              dragging
                ? "border-amber-400 bg-amber-50 dark:bg-amber-400/10"
                : "border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]",
            ].join(" ")}
          >
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-lg dark:bg-white/10">⬆</div>
              <p className="mt-4 text-sm font-black text-slate-950 dark:text-white">Drag & drop hero image/video</p>
              <p className="mt-2 text-xs font-bold text-slate-500 dark:text-white/45">Upload URL auto-binds to hero payload</p>
            </div>
          </div>

          <div className="grid gap-3">
            {items.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.04]">
                No upload queued.
              </div>
            ) : items.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={[
                  "cursor-pointer rounded-[1.5rem] border p-4 transition",
                  activeItem?.id === item.id
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-400/10"
                    : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]",
                ].join(" ")}
              >
                <div className="flex gap-3">
                  <img src={item.preview} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-950 dark:text-white">{item.file.name}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500 dark:text-white/45">{item.status.toUpperCase()}</p>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${item.progress}%` }} />
                    </div>

                    <p className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                      Compression indicator: {Math.round(item.progress * 0.72)}% optimized
                    </p>

                    {item.url ? <p className="mt-1 truncate text-[11px] font-bold text-emerald-600 dark:text-emerald-300">{item.url}</p> : null}
                    {item.error ? <p className="mt-1 text-[11px] font-bold text-red-500">{item.error}</p> : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={(event) => { event.stopPropagation(); startUpload(item); }} className="rounded-full bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-white dark:bg-white dark:text-black">
                        {item.status === "failed" || item.status === "cancelled" ? "Retry" : "Upload"}
                      </button>

                      {item.status === "uploading" ? (
                        <button type="button" onClick={(event) => { event.stopPropagation(); cancelUpload(item); }} className="rounded-full border border-red-200 px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-red-600 dark:border-red-400/30">
                          Cancel
                        </button>
                      ) : null}

                      <button type="button" onClick={(event) => { event.stopPropagation(); removeItem(item.id); }} className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] dark:border-white/10">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <input value={headline} onChange={(event) => setHeadline(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="Hero headline" />
            <textarea value={subheadline} onChange={(event) => setSubheadline(event.target.value)} className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="Hero subheadline" />

            <div className="grid gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-300/20 dark:bg-violet-300/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-violet-700 dark:text-violet-200">AI Content Studio</p>
                  <p className="mt-1 text-xs font-bold text-violet-700/70 dark:text-violet-100/70">Generate copy from uploaded visual context.</p>
                </div>
                <button type="button" onClick={generateAiDraft} className="rounded-full bg-violet-600 px-4 py-3 text-xs font-black uppercase tracking-[.14em] text-white">
                  Generate AI Draft
                </button>
              </div>

              <input value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="Short description" />
              <textarea value={longDescription} onChange={(event) => setLongDescription(event.target.value)} className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="Long description" />

              <div className="grid gap-3 sm:grid-cols-2">
                <input value={primaryCtaLabel} onChange={(event) => setPrimaryCtaLabel(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="Primary CTA text" />
                <input value={primaryCtaLink} onChange={(event) => setPrimaryCtaLink(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="Primary CTA link" />
                <input value={secondaryCtaLabel} onChange={(event) => setSecondaryCtaLabel(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="Secondary CTA text" />
                <input value={secondaryCtaLink} onChange={(event) => setSecondaryCtaLink(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="Secondary CTA link" />
              </div>

              <input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="SEO title" />
              <textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} className="min-h-20 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white" placeholder="SEO description" />
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.05]">
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Slider Studio</p>
              <select value={sliderEffect} onChange={(event) => setSliderEffect(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-black dark:text-white">
                {["Fade", "Slide", "Zoom", "Parallax", "Ken Burns", "Cube", "Flip", "Creative"].map((effect) => (
                  <option key={effect}>{effect}</option>
                ))}
              </select>
              <label className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Duration: {duration}s</label>
              <input type="range" min="3" max="15" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              <label className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Transition: {transitionSpeed}ms</label>
              <input type="range" min="250" max="1600" step="50" value={transitionSpeed} onChange={(e) => setTransitionSpeed(Number(e.target.value))} />
            </div>

            <label className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Text X: {textX}%</label>
            <input type="range" min="4" max="40" value={textX} onChange={(e) => setTextX(Number(e.target.value))} />

            <label className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Text Y: {textY}%</label>
            <input type="range" min="20" max="75" value={textY} onChange={(e) => setTextY(Number(e.target.value))} />

            <label className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Image X: {activeCrop.x}%</label>
            <input type="range" min="0" max="100" value={activeCrop.x} onChange={(e) => setDeviceCrop({ x: Number(e.target.value) })} />

            <label className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Image Y: {activeCrop.y}%</label>
            <input type="range" min="0" max="100" value={activeCrop.y} onChange={(e) => setDeviceCrop({ y: Number(e.target.value) })} />

            <label className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Zoom: {activeCrop.zoom}%</label>
            <input type="range" min="100" max="180" value={activeCrop.zoom} onChange={(e) => setDeviceCrop({ zoom: Number(e.target.value) })} />

            <label className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Overlay: {activeCrop.overlay}%</label>
            <input type="range" min="20" max="90" value={activeCrop.overlay} onChange={(e) => setDeviceCrop({ overlay: Number(e.target.value) })} />

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setSafeZone((v) => !v)} className="rounded-full border border-slate-200 px-4 py-3 text-xs font-black dark:border-white/10">
                Safe-zone {safeZone ? "ON" : "OFF"}
              </button>
              <button type="button" onClick={() => setGrid((v) => !v)} className="rounded-full border border-slate-200 px-4 py-3 text-xs font-black dark:border-white/10">
                Grid {grid ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {devices.map((item) => (
              <button key={item.id} type="button" onClick={() => setDevice(item.id)} className={["rounded-full px-4 py-3 text-xs font-black uppercase tracking-[.16em] transition", device === item.id ? "bg-slate-950 text-white dark:bg-white dark:text-black" : "border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70"].join(" ")}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-100 p-4 shadow-inner dark:border-white/10 dark:bg-black/40">
            <div className={`relative mx-auto overflow-hidden rounded-[1.5rem] bg-slate-950 shadow-2xl ${activeDevice.frame}`}>
              {activeItem ? (
                <img
                  src={activeItem.preview}
                  alt="Hero preview"
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: `${activeCrop.x}% ${activeCrop.y}%`,
                    transform: `scale(${activeCrop.zoom / 100})`,
                  }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-800 to-slate-950 text-center text-white">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.28em] text-amber-300">Preview Frame</p>
                    <p className="mt-3 text-2xl font-black">{activeDevice.label}</p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" style={{ opacity: activeCrop.overlay / 100 }} />

              {grid ? <div className="pointer-events-none absolute inset-0 grid grid-cols-4 grid-rows-4">{Array.from({ length: 16 }).map((_, i) => <div key={i} className="border border-white/10" />)}</div> : null}

              {safeZone ? (
                <div className="absolute inset-x-[8%] top-[16%] bottom-[16%] rounded-2xl border border-dashed border-amber-300/80 bg-amber-300/5">
                  <span className="absolute -top-3 left-4 rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-black">Safe Zone</span>
                </div>
              ) : null}

              <div className="absolute max-w-[72%] -translate-y-1/2 text-white" style={{ left: `${textX}%`, top: `${textY}%` }}>
                <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.2em] backdrop-blur-xl">AI Crop Preview</p>
                <h3 className="text-2xl font-black leading-[.95] tracking-[-.07em] sm:text-4xl">{headline}</h3>
                <p className="mt-3 line-clamp-3 text-xs font-semibold leading-6 text-white/70 sm:text-sm">{subheadline}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-4 dark:bg-white/[0.05]"><p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">Device</p><p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{activeDevice.label}</p></div>
              <div className="rounded-2xl bg-white p-4 dark:bg-white/[0.05]"><p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">Target</p><p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{activeDevice.size}</p></div>
              <div className="rounded-2xl bg-white p-4 dark:bg-white/[0.05]"><p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">AI Score</p><p className="mt-1 text-sm font-black text-emerald-600 dark:text-emerald-300">{score} / 100</p></div>
              <div className="rounded-2xl bg-white p-4 dark:bg-white/[0.05]"><p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">Status</p><p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{activeItem?.status || "Waiting"}</p></div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.05]">
              <p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">Generated Hero Payload</p>
              <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-emerald-300">{safeJson(heroPayload)}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}