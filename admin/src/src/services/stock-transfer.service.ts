import axios from "axios";
import { attachAuthExpiryInterceptor, attachBearerToken } from "@/api/auth-expiry";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const stockTransferApi = axios.create({
  baseURL: API,
  withCredentials: true,
});

attachBearerToken(stockTransferApi);
attachAuthExpiryInterceptor(stockTransferApi);

export type StockTransferPayload = {
  variantId: string;
  quantity: number;
  fromWarehouseLocation?: string;
  toWarehouseLocation: string;
  reason?: string;
};

export const transferStock = async (
  payload: StockTransferPayload
) => {
  const res = await stockTransferApi.post(
    "/stock-transfers",
    payload
  );

  return res.data;
};


