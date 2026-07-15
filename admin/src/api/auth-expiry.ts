const SESSION_INVALID_CODES = new Set([
  "AUTH_TOKEN_EXPIRED",
  "TOKEN_EXPIRED",
  "AUTH_TOKEN_INVALID",
  "INVALID_TOKEN",
  "SESSION_EXPIRED",
  "UNAUTHENTICATED",
]);

const AUTH_PROBE_PATHS = [
  "/auth/me",
  "/auth/profile",
  "/auth/session",
  "/auth/verify",
  "/auth/refresh",
];

let redirectInProgress = false;

function requestPath(error: any): string {
  const url = String(error?.config?.url ?? "");
  try {
    return new URL(url, window.location.origin).pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function shouldExpireSession(error: any): boolean {
  if (error?.response?.status !== 401) return false;

  const code = String(
    error?.response?.data?.code ??
      error?.response?.data?.error?.code ??
      error?.response?.data?.error ??
      ""
  ).toUpperCase();

  if (SESSION_INVALID_CODES.has(code)) return true;

  const path = typeof window !== "undefined" ? requestPath(error) : "";
  return AUTH_PROBE_PATHS.some((authPath) => path.includes(authPath));
}

export function expireAuthSession(): void {
  if (typeof window === "undefined" || redirectInProgress) return;
  redirectInProgress = true;

  ["token", "user", "admin", "adminUser", "accessToken", "authToken", "role"].forEach(
    (key) => localStorage.removeItem(key)
  );

  if (!window.location.pathname.startsWith("/login")) {
    window.location.replace("/login?reason=session-expired");
  }
}

export function attachAuthExpiryInterceptor(instance: any): void {
  if (!instance?.interceptors?.response) return;

  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (shouldExpireSession(error)) {
        expireAuthSession();
      }
      return Promise.reject(error);
    }
  );
}

export function attachBearerToken(instance: any): void {
  if (!instance?.interceptors?.request) return;

  instance.interceptors.request.use((config: any) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
}
