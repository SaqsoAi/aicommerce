
// PHASE_12_3B_TOKEN_EXPIRY_HANDLER
const handleAuthExpiry = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("admin");

  const currentPath = window.location.pathname;
  const loginPath = currentPath.startsWith("/login") ? "/login" : "/login";

  if (!currentPath.includes("/login")) {
    window.location.href = loginPath;
  }
};

const attachAuthExpiryInterceptor = (instance: any) => {
  if (!instance?.interceptors?.response) return;

  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        handleAuthExpiry();
      }

      return Promise.reject(error);
    }
  );
};

import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: API,
});


attachAuthExpiryInterceptor(api);
const getAuthConfig = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

export default api;

export type ProductVariantPayload = {
  color: string;
  size: string;
  stock: number;

  sku: string;
  barcode?: string;

  price?: number;
  availableStock?: number;
  lowStockThreshold?: number;
  reservedStock?: number;
  supplierSku?: string;
  warehouseLocation?: string;
};

export type ProductMetaPayload = {
  name: string;
  value: string;
};

export type ProductPayload = {
  name: string;

  description: string;
  shortDescription?: string;

  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;

  categoryId: string;
  subcategoryId?: string;
  brandId?: string;

  sku: string;
  styleNo?: string;
  barcode?: string;

  price: number;
  discountPrice?: number;

  featured?: boolean;
  trending?: boolean;
  status?: string;
  visibility?: string;

  thumbnail?: string;
  videoUrl?: string;

  gallery?: any[];

  variants?: ProductVariantPayload[];
  specifications?: ProductMetaPayload[];
  attributes?: ProductMetaPayload[];
};

export const createProduct = async (data: ProductPayload) => {
  const response = await api.post("/products", data, getAuthConfig());

  return response.data;
};

export const getProducts = async () => {
  const url = `${API}/products`;

  console.log("ADMIN_PRODUCTS_API_URL", url);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Product load failed: ${response.status}`);
  }

  return response.json();
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`, getAuthConfig());

  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

export const updateProduct = async (id: string, data: ProductPayload) => {
  const response = await api.put(`/products/${id}`, data, getAuthConfig());

  return response.data;
};

export const submitProductForReview = async (id: string, note?: string) => {
  const response = await api.post(`/products/${id}/submit-review`, { note }, getAuthConfig());
  return response.data;
};

export const approveProduct = async (id: string, note?: string) => {
  const response = await api.post(`/products/${id}/approve`, { note }, getAuthConfig());
  return response.data;
};

export const rejectProduct = async (id: string, note?: string) => {
  const response = await api.post(`/products/${id}/reject`, { note }, getAuthConfig());
  return response.data;
};

export const scheduleProduct = async (id: string, publishAt?: string, unpublishAt?: string) => {
  const response = await api.post(`/products/${id}/schedule`, { publishAt, unpublishAt }, getAuthConfig());
  return response.data;
};
