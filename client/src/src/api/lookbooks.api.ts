import api from "./client";

export const getPublishedLookbooks = async () => {
  try {
    const res = await api.get("/lookbooks/public");
    return res.data.data ?? [];
  } catch (error) {
    console.error("Failed to load published lookbooks", error);
    return [];
  }
};

export const getLookbookBySlug = async (slug: string) => {
  try {
    const res = await api.get(`/lookbooks/${slug}`);
    return res.data.data ?? null;
  } catch (error) {
    console.error("Failed to load lookbook", error);
    return null;
  }
};
