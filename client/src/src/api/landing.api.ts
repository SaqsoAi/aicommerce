export type PublicLandingSection = {
  id: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  sortOrder: number;
  configJson?: Record<string, unknown> | null;
};

export type PublicLandingPage = {
  id: string;
  name: string;
  slug: string;
  title: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  template: string;
  isPublished: boolean;
  sections: PublicLandingSection[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getPublicLandingBySlug(slug: string): Promise<PublicLandingPage | null> {
  try {
    const res = await fetch(`${API_URL}/landing/slug/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}
