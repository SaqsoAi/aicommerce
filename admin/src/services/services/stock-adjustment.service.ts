import axios from "axios";
import { attachAuthExpiryInterceptor, attachBearerToken } from "@/api/auth-expiry";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const stockAdjustmentApi = axios.create({
  baseURL: API,
  withCredentials: true,
});

attachBearerToken(stockAdjustmentApi);
attachAuthExpiryInterceptor(stockAdjustmentApi);

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


