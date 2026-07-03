
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
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const stockAdjustmentApi = axios.create({
  baseURL: API,
  withCredentials: true,
});

export type StockAdjustmentPayload = {
  variantId: string;
  type: "INCREASE" | "DECREASE" | "SET";
  quantity: number;
  reason?: string;
  warehouseLocation?: string;
};

export const adjustStock = async (
  payload: StockAdjustmentPayload
) => {
  const res = await stockAdjustmentApi.post(
    "/stock-adjustments",
    payload
  );

  return res.data;
};
