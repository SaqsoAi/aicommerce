import api from "@/api/client";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const normalizeList = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.brands)) return value.brands;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

export const getBrands = async (search?: string) => {
  const res = await api.get("/brands", {
    params: { search },
  });

  return normalizeList(res.data);
};

export const createBrand = async (data: {
  name: string;
  logo?: string;
}) => {
  const res = await api.post("/brands", data);
  return res.data?.data || res.data;
};

export const updateBrand = async (
  id: string,
  data: {
    name: string;
    logo?: string;
  }
) => {
  const res = await api.put(`/brands/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteBrand = async (id: string) => {
  const res = await api.delete(`/brands/${id}`);
  return res.data;
};
