"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { createCroppedImage, type PixelCrop } from "./cropImage";

type Props = {
  label: string;
  value?: string;
  uploadUrl: string;
  aspect?: number;
  outputWidth?: number;
  outputHeight?: number;
  onUploaded: (url: string) => void;
};

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000";

const normalizeUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${SERVER_URL}${url}`;
  return url;
};

export default function ImageUploader({
  label,
  value,
  uploadUrl,
  aspect = 1,
  outputWidth = 800,
  outputHeight = 800,
  onUploaded,
}: Props) {
  const [source, setSource] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((_area: any, croppedAreaPixels: PixelCrop) => {
    setPixelCrop(croppedAreaPixels);
  }, []);

  const selectFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result));
    reader.readAsDataURL(file);
  };

  const upload = async () => {
    if (!source || !pixelCrop) return;

    try {
      setUploading(true);

      const croppedFile = await createCroppedImage(
        source,
        pixelCrop,
        outputWidth,
        outputHeight,
        `image-${Date.now()}.webp`
      );

      const compressedFile = await imageCompression(croppedFile, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: Math.max(outputWidth, outputHeight),
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Upload failed");
        return;
      }

      const url = data.data?.url || data.url;
      onUploaded(url);
      setSource("");
      setZoom(1);
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-black">{label}</p>
          <p className="text-xs text-zinc-500">
            Manual crop + auto resolution fix + WebP compression.
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) selectFile(file);
          }}
          className="max-w-[220px] text-xs"
        />
      </div>

      {value ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold text-zinc-500">Current Image</p>
          <img
            src={normalizeUrl(value)}
            alt={label}
            className="h-28 w-28 rounded-xl bg-white object-contain p-2 dark:bg-zinc-950"
          />
        </div>
      ) : null}

      {source ? (
        <div className="space-y-4">
          <div className="relative h-[320px] overflow-hidden rounded-2xl bg-black">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.1}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={upload}
              disabled={uploading}
              className="rounded-xl bg-black px-5 py-3 text-sm font-black text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {uploading ? "Uploading..." : "Crop + Upload"}
            </button>

            <button
              type="button"
              onClick={() => setSource("")}
              className="rounded-xl border px-5 py-3 text-sm font-black"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
