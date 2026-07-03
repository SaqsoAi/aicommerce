"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ImageIcon, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { brandTrace, brandTraceError } from "@/components/store-settings/brandRuntimeTrace";

export type UploadResponse = {
  success?: boolean;
  message?: string;
  url?: string;
  path?: string;
  src?: string;
  data?: {
    url?: string;
    path?: string;
    src?: string;
    filename?: string;
    mime?: string;
    size?: number;
  };
};

type Props = {
  label: string;
  type:
    | "logo"
    | "dark-logo"
    | "white-logo"
    | "footer-logo"
    | "favicon"
    | "mobile-logo"
    | "invoice-logo"
    | "email-logo"
    | "pwa-icon";
  value?: string;
  onUploaded: (payload: any) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  accept?: string;
  maxSizeMb?: number;
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

function extractUploadUrl(payload: UploadResponse) {
  return (
    payload?.url ||
    payload?.path ||
    payload?.src ||
    payload?.data?.url ||
    payload?.data?.path ||
    payload?.data?.src ||
    ""
  );
}

export default function BrandingAssetUploader({
  label,
  type,
  value,
  onUploaded,
  onRemove,
  accept = "image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/x-icon",
  maxSizeMb = 8,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [status, setStatus] = useState("");

  const preview = useMemo(() => localPreview || resolveAssetUrl(value), [localPreview, value]);

  async function upload(file: File) {
    brandTrace("BrandingAssetUploader", "upload:start", {
      label,
      type,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    setStatus("");

    if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith(".ico")) {
      setStatus("Only image files are allowed.");
      brandTrace("BrandingAssetUploader", "upload:validation-failed", { reason: "invalid-type", fileType: file.type });
      return;
    }

    const sizeMb = file.size / 1024 / 1024;
    if (sizeMb > maxSizeMb) {
      setStatus(`File is too large. Max ${maxSizeMb} MB allowed.`);
      brandTrace("BrandingAssetUploader", "upload:validation-failed", { reason: "too-large", sizeMb, maxSizeMb });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("label", label);
      formData.append("storage", "local");

      const endpoint = apiPath("/branding-upload");

      brandTrace("BrandingAssetUploader", "upload:request", { endpoint, label, type });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const json: UploadResponse | null = await res.json().catch(() => null);

      brandTrace("BrandingAssetUploader", "upload:response", {
        ok: res.ok,
        status: res.status,
        json,
      });

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Upload failed with status ${res.status}`);
      }

      const url = extractUploadUrl(json || {});
      if (!url) throw new Error("Upload succeeded but server did not return an asset URL.");

      brandTrace("BrandingAssetUploader", "upload:onUploaded", { url });
      await onUploaded(url);

      setLocalPreview("");
      setStatus("Uploaded and saved.");
      brandTrace("BrandingAssetUploader", "upload:success", { url });
    } catch (error: any) {
      console.error(error);
      brandTraceError("BrandingAssetUploader", "upload:error", error);
      setStatus(error?.message || "Upload failed.");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFile(file?: File | null) {
    brandTrace("BrandingAssetUploader", "file:selected", {
      label,
      type,
      hasFile: Boolean(file),
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
    });

    if (!file || uploading) return;
    upload(file);
  }

  async function removeAsset() {
    setLocalPreview("");
    setStatus("");

    brandTrace("BrandingAssetUploader", "remove:start", { label, type, value });

    if (onRemove) {
      await onRemove();
      return;
    }

    await onUploaded("");
    setStatus("Asset removed.");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-black/20">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={uploading}
        onClick={() => {
          brandTrace("BrandingAssetUploader", "input:click", { label, type });
        }}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <label
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
          brandTrace("BrandingAssetUploader", "drag:enter", { label, type });
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={[
          "group flex min-h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-4 text-center transition",
          dragging
            ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-400/10"
            : "border-slate-300 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-cyan-400/10",
          uploading ? "pointer-events-none opacity-70" : "",
        ].join(" ")}
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="max-h-20 max-w-[220px] rounded-xl bg-white object-contain p-2 shadow-sm"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/10">
            <ImageIcon size={24} className="text-slate-400" />
          </div>
        )}

        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {uploading ? "Uploading..." : value ? "Replace Asset" : "Upload Asset"}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-white/45">
            Drag & drop or click to upload local file
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {uploading ? "Saving..." : "Choose File"}
        </span>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black dark:border-white/10 dark:bg-white/[0.06]"
        >
          <RefreshCw size={14} /> Replace
        </label>

        {(value || localPreview) && (
          <button
            type="button"
            disabled={uploading}
            onClick={removeAsset}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600 disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      {status ? (
        <p className="mt-3 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-white/[0.06] dark:text-white/60">
          {status}
        </p>
      ) : null}
    </div>
  );
}
