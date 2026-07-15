import axios from "axios";
import { attachAuthExpiryInterceptor, attachBearerToken } from "@/api/auth-expiry";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const inventoryApi = axios.create({
  baseURL: API,
  withCredentials: true,
});

attachBearerToken(inventoryApi);
attachAuthExpiryInterceptor(inventoryApi);

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


