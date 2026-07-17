"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

type GeneratedKey =
  | "darkLogoUrl"
  | "whiteLogoUrl"
  | "mobileLogoUrl"
  | "faviconUrl"
  | "appleTouchIconUrl"
  | "androidIconUrl"
  | "pwaIconUrl";

type Props = {
  logoUrl?: string;
  appIconUrl?: string;
  onGenerated: (key: GeneratedKey, url: string) => Promise<void> | void;
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

function resolveAssetUrl(value?: string) {
  if (!value) return "";
  if (value.startsWith("blob:")) return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${serverOrigin()}${value}`;
  return `${serverOrigin()}/${value}`;
}

async function imageFromUrl(src: string) {
  const response = await fetch(src, { cache: "no-store" });
  const blob = await response.blob();

  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read uploaded image."));
    };

    img.src = url;
  });
}

function drawContained(
  image: HTMLImageElement,
  width: number,
  height: number,
  tint?: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported.");

  ctx.clearRect(0, 0, width, height);

  const scale = Math.min(width / image.width, height / image.height) * 0.86;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.drawImage(image, x, y, drawWidth, drawHeight);

  if (tint) {
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }

  return canvas;
}

async function canvasToFile(canvas: HTMLCanvasElement, filename: string) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) reject(new Error("Failed to create generated image."));
      else resolve(result);
    }, "image/png");
  });

  return new File([blob], filename, { type: "image/png" });
}

async function uploadGenerated(file: File, type: string, label: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  formData.append("label", label);
  formData.append("generatedBy", "ai-brand-asset-generator");
  formData.append("storage", "local");

  const res = await fetch(apiPath("/branding-upload"), {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Upload failed: ${label}`);
  }

  const url =
    json?.data?.url ||
    json?.data?.path ||
    json?.url ||
    json?.path ||
    "";

  if (!url) throw new Error(`No URL returned for ${label}.`);

  return url;
}

const TASKS: Array<{
  key: GeneratedKey;
  source: "logo" | "icon";
  label: string;
  type: string;
  width: number;
  height: number;
  tint?: string;
}> = [
  {
    key: "darkLogoUrl",
    source: "logo",
    label: "Dark Logo / Black Logo",
    type: "dark-logo",
    width: 600,
    height: 200,
    tint: "#111111",
  },
  {
    key: "whiteLogoUrl",
    source: "logo",
    label: "White Logo",
    type: "white-logo",
    width: 600,
    height: 200,
    tint: "#ffffff",
  },
  {
    key: "mobileLogoUrl",
    source: "icon",
    label: "Mobile Logo",
    type: "mobile-logo",
    width: 256,
    height: 256,
  },
  {
    key: "faviconUrl",
    source: "icon",
    label: "Favicon",
    type: "favicon",
    width: 64,
    height: 64,
  },
  {
    key: "appleTouchIconUrl",
    source: "icon",
    label: "Apple Touch Icon",
    type: "pwa-icon",
    width: 180,
    height: 180,
  },
  {
    key: "androidIconUrl",
    source: "icon",
    label: "Android Icon",
    type: "pwa-icon",
    width: 192,
    height: 192,
  },
  {
    key: "pwaIconUrl",
    source: "icon",
    label: "PWA Icon",
    type: "pwa-icon",
    width: 512,
    height: 512,
  },
];

export default function AIBrandAssetGenerator({
  logoUrl,
  appIconUrl,
  onGenerated,
}: Props) {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");

  const ready = useMemo(() => Boolean(logoUrl && appIconUrl), [logoUrl, appIconUrl]);

  async function generate() {
    if (!logoUrl || !appIconUrl) {
      setStatus("Upload Website Logo and App Icon first.");
      return;
    }

    setRunning(true);
    setStatus("Reading uploaded logo and icon...");

    try {
      const logo = await imageFromUrl(resolveAssetUrl(logoUrl));
      const icon = await imageFromUrl(resolveAssetUrl(appIconUrl));

      for (const task of TASKS) {
        setStatus(`Generating ${task.label}...`);

        const source = task.source === "logo" ? logo : icon;
        const canvas = drawContained(source, task.width, task.height, task.tint);
        const file = await canvasToFile(
          canvas,
          `${task.key}-${task.width}x${task.height}.png`
        );

        const url = await uploadGenerated(file, task.type, task.label);
        await onGenerated(task.key, url);
      }

      window.dispatchEvent(new Event("ai-commerce-brand-refresh"));
      window.dispatchEvent(new Event("ai-commerce-settings-refresh"));
      window.dispatchEvent(new Event("storage"));

      setStatus("AI generated all brand assets and saved them.");
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || "AI brand asset generation failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mb-5 rounded-[2rem] border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-400/20 dark:bg-cyan-400/10 md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
            <Sparkles size={15} /> AI Brand Asset Generator
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
            Upload one Logo + one App Icon, then generate all required brand assets.
          </h3>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-600 dark:text-white/60">
            Local mode supported now. It creates white logo for dark mode, black logo for light mode,
            mobile icon, favicon, Apple Touch, Android and PWA icons using transparent PNG output.
          </p>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={!ready || running}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {running ? "Generating..." : "Generate Brand Assets"}
        </button>
      </div>

      {status ? (
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 dark:bg-black/20 dark:text-white/70">
          {status}
        </p>
      ) : null}
    </div>
  );
}
