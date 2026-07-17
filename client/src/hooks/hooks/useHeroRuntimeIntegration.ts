export type HeroRuntimeDevice = "desktop" | "laptop" | "tablet" | "mobile";

export type HeroRuntimeCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HeroRuntimeEvent = {
  heroId: string;
  variantId?: string;
  device: HeroRuntimeDevice;
  event: "view" | "click" | "cta";
  crop?: HeroRuntimeCrop;
};

export function getHeroDevice(width = typeof window !== "undefined" ? window.innerWidth : 1440): HeroRuntimeDevice {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1440) return "laptop";
  return "desktop";
}

export function selectHeroVariant<T extends { id?: string; weight?: number }>(variants: T[]): T | null {
  if (!variants.length) return null;
  const weighted = variants.flatMap((variant) =>
    Array(Math.max(1, Number(variant.weight || 1))).fill(variant)
  );
  const index = Math.floor(Date.now() / 60000) % weighted.length;
  return weighted[index] || variants[0];
}

export function getCropObjectPosition(crop?: HeroRuntimeCrop) {
  if (!crop) return "50% 50%";
  const x = Math.max(0, Math.min(100, crop.x + crop.width / 2));
  const y = Math.max(0, Math.min(100, crop.y + crop.height / 2));
  return `${x}% ${y}%`;
}

export function getDeviceCrop(
  crops?: Partial<Record<HeroRuntimeDevice, HeroRuntimeCrop>>,
  device: HeroRuntimeDevice = getHeroDevice()
) {
  return crops?.[device] || crops?.desktop || crops?.laptop || crops?.tablet || crops?.mobile;
}

export function queueHeroRuntimeEvent(payload: HeroRuntimeEvent) {
  if (typeof window === "undefined") return;
  const key = "ai-commerce:hero-analytics-queue";
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  current.push({ ...payload, queuedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(current.slice(-100)));
}

export async function trackHeroRuntimeEvent(payload: HeroRuntimeEvent) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${apiBase}/homepage-hero/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...payload, createdAt: new Date().toISOString() }),
    });

    if (!response.ok) queueHeroRuntimeEvent(payload);
    return { ok: response.ok, status: response.status };
  } catch {
    queueHeroRuntimeEvent(payload);
    return { ok: false, status: 0 };
  }
}

export async function flushQueuedHeroRuntimeEvents() {
  if (typeof window === "undefined") return { ok: true, flushed: 0 };
  const key = "ai-commerce:hero-analytics-queue";
  const queue = JSON.parse(localStorage.getItem(key) || "[]") as HeroRuntimeEvent[];
  if (!queue.length) return { ok: true, flushed: 0 };

  let flushed = 0;
  for (const event of queue) {
    const result = await trackHeroRuntimeEvent(event);
    if (result.ok) flushed += 1;
  }

  if (flushed > 0) {
    localStorage.setItem(key, JSON.stringify(queue.slice(flushed)));
  }

  return { ok: true, flushed };
}

export async function trackHeroEnterpriseRuntimeEvent(payload: HeroRuntimeEvent) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${apiBase}/homepage-hero-enterprise/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...payload, createdAt: new Date().toISOString() }),
    });

    if (!response.ok) {
      return trackHeroRuntimeEvent(payload);
    }

    return { ok: true, status: response.status, source: "enterprise" };
  } catch {
    return trackHeroRuntimeEvent(payload);
  }
}
