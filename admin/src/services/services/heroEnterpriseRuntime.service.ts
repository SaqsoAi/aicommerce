export type HeroDeviceKey = "desktop" | "laptop" | "tablet" | "mobile";

export type HeroCropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HeroRuntimeDraftPayload = {
  heroId: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  lockedVersion?: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  cropJson?: Partial<Record<HeroDeviceKey, HeroCropBox>>;
  aiVision?: unknown;
  approvalNote?: string;
};

export type HeroAnalyticsPayload = {
  heroId: string;
  variantId?: string;
  device: HeroDeviceKey;
  event: "view" | "click" | "cta";
  crop?: HeroCropBox;
};

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function safeJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function saveHeroRuntimeDraft(payload: HeroRuntimeDraftPayload) {
  const localKey = `ai-commerce:hero-runtime-draft:${payload.heroId}`;
  if (typeof window !== "undefined") {
    localStorage.setItem(localKey, JSON.stringify({ ...payload, savedAt: new Date().toISOString() }));
  }

  try {
    const response = await fetch(`${apiBase()}/homepage-hero/${payload.heroId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        status: payload.status,
        scheduledAt: payload.scheduledAt,
        publishedAt: payload.publishedAt,
        cropJson: payload.cropJson,
        aiVisionJson: payload.aiVision,
        approvalNote: payload.approvalNote,
        lockedVersion: payload.lockedVersion,
      }),
    });

    if (!response.ok) {
      return { ok: false, source: "local", status: response.status };
    }

    return { ok: true, source: "server", data: await safeJson<unknown>(response) };
  } catch {
    return { ok: true, source: "local" };
  }
}

export async function trackAdminHeroAnalytics(payload: HeroAnalyticsPayload) {
  try {
    const response = await fetch(`${apiBase()}/homepage-hero/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...payload, createdAt: new Date().toISOString() }),
    });

    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function restoreHeroVersion(heroId: string, versionId: string) {
  try {
    const response = await fetch(`${apiBase()}/homepage-hero/${heroId}/versions/${versionId}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) return { ok: false, status: response.status };
    return { ok: true, data: await safeJson<unknown>(response) };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function saveHeroEnterpriseDraft(payload: HeroRuntimeDraftPayload) {
  const response = await fetch(`${apiBase()}/homepage-hero-enterprise/${payload.heroId}/drafts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return saveHeroRuntimeDraft(payload);
  }

  return { ok: true, source: "server-enterprise", data: await safeJson<unknown>(response) };
}

export async function listHeroEnterpriseDrafts(heroId: string) {
  const response = await fetch(`${apiBase()}/homepage-hero-enterprise/${heroId}/drafts`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) return { ok: false, data: [] };
  return { ok: true, data: await safeJson<unknown>(response) };
}

export async function createHeroEnterpriseVersion(heroId: string, snapshotJson: unknown, note?: string) {
  const response = await fetch(`${apiBase()}/homepage-hero-enterprise/${heroId}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ snapshotJson, note }),
  });

  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, data: await safeJson<unknown>(response) };
}

export async function listHeroEnterpriseVersions(heroId: string) {
  const response = await fetch(`${apiBase()}/homepage-hero-enterprise/${heroId}/versions`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) return { ok: false, data: [] };
  return { ok: true, data: await safeJson<unknown>(response) };
}

export async function restoreHeroEnterpriseVersion(heroId: string, versionId: string) {
  const response = await fetch(`${apiBase()}/homepage-hero-enterprise/${heroId}/versions/${versionId}/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    return restoreHeroVersion(heroId, versionId);
  }

  return { ok: true, data: await safeJson<unknown>(response) };
}

export async function trackHeroEnterpriseAnalytics(payload: HeroAnalyticsPayload) {
  const response = await fetch(`${apiBase()}/homepage-hero-enterprise/analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return trackAdminHeroAnalytics(payload);
  }

  return { ok: true, status: response.status };
}
