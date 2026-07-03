"use client";

import { useMemo, useState } from "react";
import { normalizeImageUrl } from "@/lib/normalizeImageUrl";

type GalleryImage = {
  url?: string | null;
  isThumbnail?: boolean;
};

type Props = {
  thumbnail?: string | null;
  images?: GalleryImage[];
  gallery?: GalleryImage[];
  alt?: string;
};

export default function ProductGallery({
  thumbnail,
  images = [],
  gallery = [],
  alt = "Product Image",
}: Props) {
  const allImages = useMemo(() => {
    const urls = [
      thumbnail,
      ...images.map((item) => item.url),
      ...gallery.map((item) => item.url),
    ]
      .filter(Boolean)
      .map((url) => normalizeImageUrl(String(url)));

    return Array.from(new Set(urls));
  }, [thumbnail, images, gallery]);

  const safeImages =
    allImages.length > 0 ? allImages : ["/placeholder-product.svg"];

  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const activeImage = safeImages[activeIndex] || safeImages[0];

  const updateZoom = (delta: number) => {
    setZoomLevel((prev) =>
      Math.min(4, Math.max(1, Number((prev + delta).toFixed(2))))
    );
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    updateZoom(event.deltaY < 0 ? 0.15 : -0.15);
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % safeImages.length);
    setZoomLevel(1);
  };

  const prevImage = () => {
    setActiveIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
    setZoomLevel(1);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5">
        <button
          type="button"
          onClick={() => {
            setFullscreen(true);
            setZoomLevel(1);
          }}
          onMouseEnter={() => setHoverZoom(true)}
          onMouseLeave={() => setHoverZoom(false)}
          className="group relative flex aspect-[4/5] max-h-[760px] w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-3xl"
        >
          <span className="absolute right-3 top-3 z-20 rounded-full bg-black/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur">
            Click Zoom
          </span>

          <img
            src={activeImage}
            alt={alt}
            className={`h-full w-full object-contain transition duration-500 ${
              hoverZoom ? "scale-105" : "scale-100"
            }`}
          />
        </button>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:gap-3">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setZoomLevel(1);
              }}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-zinc-100 p-1 transition dark:bg-zinc-950 sm:h-24 sm:w-24 ${
                activeIndex === index
                  ? "border-black ring-2 ring-black dark:border-white dark:ring-white"
                  : "border-zinc-300 dark:border-zinc-800"
              }`}
            >
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="h-full w-full rounded-lg object-contain"
              />
            </button>
          ))}
        </div>
      </div>

      {fullscreen ? (
        <div className="fixed inset-0 z-[9999] bg-black/95">
          <div className="absolute left-4 top-4 z-20 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur">
            Image {activeIndex + 1} / {safeImages.length} · Zoom {zoomLevel.toFixed(1)}x
          </div>

          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-20 rounded-full bg-white px-5 py-3 text-sm font-black text-black"
          >
            Close
          </button>

          <div
            onWheel={handleWheel}
            onDoubleClick={() => setZoomLevel((prev) => (prev > 1 ? 1 : 2))}
            className="flex h-full w-full cursor-zoom-in items-center justify-center overflow-auto p-6"
          >
            <img
              src={activeImage}
              alt={alt}
              style={{
                transform: `scale(${zoomLevel})`,
              }}
              className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-white/10 p-2 backdrop-blur">
            <button type="button" onClick={() => updateZoom(-0.25)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">-</button>
            <button type="button" onClick={() => setZoomLevel(1)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">Reset</button>
            <button type="button" onClick={() => updateZoom(0.25)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">+</button>
          </div>

          {safeImages.length > 1 ? (
            <>
              <button type="button" onClick={prevImage} className="absolute left-5 top-1/2 rounded-full bg-white/15 px-5 py-4 text-3xl font-black text-white backdrop-blur">‹</button>
              <button type="button" onClick={nextImage} className="absolute right-5 top-1/2 rounded-full bg-white/15 px-5 py-4 text-3xl font-black text-white backdrop-blur">›</button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
