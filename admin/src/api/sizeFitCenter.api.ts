export type SizeFitCenterSettings = {
  id?: string;
  heroJson?: unknown;
  statsJson?: unknown;
  menuJson?: unknown;
  sizeGuideJson?: unknown;
  fitGuideJson?: unknown;
  measurementJson?: unknown;
  guaranteeJson?: unknown;
  helpJson?: unknown;
  ctaJson?: unknown;
  reviewSettingsJson?: unknown;
  layoutJson?: unknown;
  active?: boolean;
};

export type SizeFitReview = {
  id: string;
  rating: number;
  comment?: string | null;
  fitRating?: string | null;
  bodyType?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  sizeOrdered?: string | null;
  verifiedPurchase?: boolean;
  isApproved?: boolean;
  isFeatured?: boolean;
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  product?: {
    id: string;
    name: string;
    slug?: string | null;
    thumbnail?: string | null;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function parseResponse(res: Response) {
  const json = await res.json();

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Size Fit Center request failed");
  }

  return json.data;
}

export async function getSizeFitCenterSettings(): Promise<SizeFitCenterSettings> {
  const res = await fetch(`${API_URL}/size-fit-center`, { cache: "no-store" });
  return parseResponse(res);
}

export async function updateSizeFitCenterSettings(
  payload: SizeFitCenterSettings
): Promise<SizeFitCenterSettings> {
  const res = await fetch(`${API_URL}/size-fit-center`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
}

export async function getSizeFitReviews(): Promise<SizeFitReview[]> {
  const res = await fetch(`${API_URL}/size-fit-center/reviews?mode=admin`, {
    cache: "no-store",
  });

  return parseResponse(res);
}

export async function approveSizeFitReview(id: string, value: boolean) {
  const res = await fetch(`${API_URL}/size-fit-center/reviews/${id}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  return parseResponse(res);
}

export async function featureSizeFitReview(id: string, value: boolean) {
  const res = await fetch(`${API_URL}/size-fit-center/reviews/${id}/feature`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  return parseResponse(res);
}