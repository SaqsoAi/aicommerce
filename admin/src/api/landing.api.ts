export type LandingSection = {
  id?: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  sortOrder: number;
  configJson?: Record<string, unknown>;
};

export type LandingPage = {
  id: string;
  name: string;
  slug: string;
  campaignId?: string | null;
  title: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  template: string;
  status: string;
  isPublished: boolean;
  sections: LandingSection[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function parseResponse(res: Response) {
  const json = await res.json();

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Landing API request failed");
  }

  return json.data;
}

export async function getLandingPages(): Promise<LandingPage[]> {
  const res = await fetch(`${API_URL}/landing`, { cache: "no-store" });
  return parseResponse(res);
}

export async function getLandingPage(id: string): Promise<LandingPage> {
  const res = await fetch(`${API_URL}/landing/${id}`, { cache: "no-store" });
  return parseResponse(res);
}

export async function createLandingPage(payload: Partial<LandingPage>) {
  const res = await fetch(`${API_URL}/landing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
}

export async function updateLandingPage(id: string, payload: Partial<LandingPage>) {
  const res = await fetch(`${API_URL}/landing/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
}

export async function deleteLandingPage(id: string) {
  const res = await fetch(`${API_URL}/landing/${id}`, {
    method: "DELETE",
  });

  return parseResponse(res);
}

export async function publishLandingPage(id: string) {
  const res = await fetch(`${API_URL}/landing/${id}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publishedBy: "admin" }),
  });

  return parseResponse(res);
}

export async function unpublishLandingPage(id: string) {
  const res = await fetch(`${API_URL}/landing/${id}/unpublish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publishedBy: "admin" }),
  });

  return parseResponse(res);
}
