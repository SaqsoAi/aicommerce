import api from "@/api/client";

export const smartSearch = async (query: string) => {
  const res = await api.post("/ai/smart-search", {
    query,
    products: [],
  });

  return res.data;
};