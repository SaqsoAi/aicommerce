const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type HomepageSectionPayload = {
  title: string;
  slug?: string;
  type: string;
  enabled?: boolean;
  sortOrder?: number;
  data?: any;
};

export type HomepageSection = {
  id: string;
  title: string;
  slug: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
  data?: any;
  createdAt?: string;
  updatedAt?: string;
};

async function readJson(res: Response) {
  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const res = await fetch(`${API}/homepage-sections`, {
    cache: "no-store",
  });

  const data = await readJson(res);

  return Array.isArray(data.data) ? data.data : [];
}

export async function createHomepageSection(payload: Partial<HomepageSection>) {
  const res = await fetch(`${API}/homepage-sections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readJson(res);
}

export async function deleteHomepageSection(id: string) {
  const res = await fetch(`${API}/homepage-sections/${id}`, {
    method: "DELETE",
  });

  return readJson(res);
}

export async function toggleHomepageSection(id: string) {
  const res = await fetch(`${API}/homepage-sections/${id}/toggle`, {
    method: "PATCH",
  });

  return readJson(res);
}

export async function reorderHomepageSections(sections: HomepageSection[]) {
  const payload = sections.map((section, index) => ({
    id: section.id,
    sortOrder: index + 1,
  }));

  const tries = [
    { items: payload },
    { sections: payload },
    { data: payload },
    { order: payload },
  ];

  let lastError: any = null;

  for (const body of tries) {
    try {
      const res = await fetch(`${API}/homepage-sections/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        return readJson(res);
      }

      lastError = await res.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(String(lastError || "Reorder failed"));
}

