
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

const inventoryApi = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const getInventory = async () => {
  const res = await inventoryApi.get("/inventory");
  return res.data;
};

export const getInventoryStats = async () => {
  const res = await inventoryApi.get("/inventory/stats");
  return res.data;
};

export const getLowStock = async () => {
  const res = await inventoryApi.get("/inventory/low-stock");
  return res.data;
};

export const getOutOfStock = async () => {
  const res = await inventoryApi.get("/inventory/out-of-stock");
  return res.data;
};

export const getInventoryHistory = async () => {
  const res = await inventoryApi.get("/inventory/history");
  return res.data;
};

export const getReconciliation = async () => {
  const res = await inventoryApi.get("/inventory/reconciliation");
  return res.data;
};
