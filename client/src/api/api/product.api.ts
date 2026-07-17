import api from "./client";

// 🧠 STEP 227 — GET PRODUCTS
export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

export const getProductById = async (id: string) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

// 🧠 STEP 228 — CREATE PRODUCT
export const createProduct = async (data: any) => {
  const res = await api.post("/products", data);
  return res.data;
};

// 🧠 STEP 229 — UPDATE PRODUCT
export const updateProduct = async (id: string, data: any) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

// 🧠 STEP 230 — DELETE PRODUCT
export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export const getFeaturedProducts = async () => {
  const res = await api.get("/products/featured");
  return res.data;
};

export const getTrendingProducts = async () => {
  const res = await api.get("/products/trending");
  return res.data;
};
