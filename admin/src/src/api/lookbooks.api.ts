import api from "./client";

export type LookbookProduct = {
  productId: string;
};

export type LookbookItem = {
  image: string;
  title?: string;
  caption?: string;
  sortOrder?: number;
  products?: LookbookProduct[];
};

export type LookbookPayload = {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  featured?: boolean;
  published?: boolean;
  items?: LookbookItem[];
};

export const getLookbooks = async () => {
  const res = await api.get("/lookbooks");
  return res.data.data ?? [];
};

export const getLookbookBySlug = async (slug: string) => {
  const res = await api.get(`/lookbooks/${slug}`);
  return res.data.data;
};

export const createLookbook = async (payload: LookbookPayload) => {
  const res = await api.post("/lookbooks", payload);
  return res.data.data;
};

export const updateLookbook = async (id: string, payload: Partial<LookbookPayload>) => {
  const res = await api.put(`/lookbooks/${id}`, payload);
  return res.data.data;
};

export const publishLookbook = async (id: string, published: boolean) => {
  const res = await api.patch(`/lookbooks/${id}/publish`, { published });
  return res.data.data;
};

export const deleteLookbook = async (id: string) => {
  const res = await api.delete(`/lookbooks/${id}`);
  return res.data;
};
