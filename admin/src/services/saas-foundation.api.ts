const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "SaaS request failed");
  }

  return data?.data ?? data;
}

export const seedSaasFoundation = () => request("/saas-foundation/seed", { method: "POST" });
export const listFeatureFlags = () => request("/saas-foundation/feature-flags");
export const saveFeatureFlag = (payload: unknown) => request("/saas-foundation/feature-flags", { method: "POST", body: JSON.stringify(payload) });
export const listPlans = () => request("/saas-foundation/plans");
export const savePlan = (payload: unknown) => request("/saas-foundation/plans", { method: "POST", body: JSON.stringify(payload) });
export const getTenantUsage = (tenantId: string) => request(`/saas-foundation/tenant-usage/${tenantId}`);
export const saveTenantQuota = (payload: unknown) => request("/saas-foundation/tenant-quotas", { method: "POST", body: JSON.stringify(payload) });
export const listTenantSubscriptions = () => request("/saas-foundation/subscription-engine");
export const getSubscriptionReadiness = () => request("/saas-foundation/subscription-engine/readiness");
export const startTenantTrial = (payload: unknown) => request("/saas-foundation/subscription-engine/trial", { method: "POST", body: JSON.stringify(payload) });
export const activateTenantSubscription = (payload: unknown) => request("/saas-foundation/subscription-engine/activate", { method: "POST", body: JSON.stringify(payload) });
export const changeTenantPlan = (payload: unknown) => request("/saas-foundation/subscription-engine/change-plan", { method: "POST", body: JSON.stringify(payload) });
export const cancelTenantSubscription = (payload: unknown) => request("/saas-foundation/subscription-engine/cancel", { method: "POST", body: JSON.stringify(payload) });
export const suspendTenantSubscription = (payload: unknown) => request("/saas-foundation/subscription-engine/suspend", { method: "POST", body: JSON.stringify(payload) });

export const checkTenantQuota = (tenantId: string, metric: string) =>
  request(`/saas-foundation/tenant-quota-check/${tenantId}/${metric}`);
