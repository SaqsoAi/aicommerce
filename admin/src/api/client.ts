import axios from "axios";
import { normalizeAssetFields } from "@/utils/resolveAssetUrl";
import {
  attachAuthExpiryInterceptor,
  attachBearerToken,
} from "@/api/auth-expiry";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

attachBearerToken(api);
attachAuthExpiryInterceptor(api);

api.interceptors.response.use((response: any) => {
  response.data = normalizeAssetFields(response.data);
  return response;
});

export default api;
