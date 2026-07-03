import { normalizeAssetFields } from "@/utils/resolveAssetUrl";

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

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});


attachAuthExpiryInterceptor(api);
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;

/* SPRINT_0_9A_ASSET_RESPONSE_NORMALIZER */
try {
  const maybeApi: any = typeof api !== "undefined" ? api : undefined;
  if (maybeApi?.interceptors?.response) {
    maybeApi.interceptors.response.use((response: any) => {
      response.data = normalizeAssetFields(response.data);
      return response;
    });
  }
} catch {
  // no-op for non-axios clients
}