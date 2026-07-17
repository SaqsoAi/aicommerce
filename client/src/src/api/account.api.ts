import { cookies } from "next/headers";

export type AccountApiResponse<T> = { success: boolean; message?: string; data: T };
const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function accountFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const session = cookieStore.get("customer_session")?.value;
  if (!session) throw new Error("Authentication required");
  const response = await fetch(`${DEFAULT_API_BASE.replace(/\/$/, "")}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}`, ...(init?.headers || {}) },
  });
  const json = (await response.json().catch(() => null)) as AccountApiResponse<T> | null;
  if (!response.ok || !json?.success) throw new Error(json?.message || `Account API failed (${response.status})`);
  return json.data;
}

export const getAccountDashboard = () => accountFetch<Record<string, any>>("/account/dashboard");
export const getAccountProfile = () => accountFetch<Record<string, any>>("/account/profile");
export const updateAccountProfile = (payload: Record<string, unknown>) => accountFetch<Record<string, any>>("/account/profile", { method: "PATCH", body: JSON.stringify(payload) });
export const getAccountOrders = () => accountFetch<any[]>("/account/orders");
export const getAccountWishlist = () => accountFetch<any[]>("/account/wishlist");
export const getAccountRewards = () => accountFetch<Record<string, any>>("/account/rewards");
export const getAccountMembership = () => accountFetch<Record<string, any> | null>("/account/membership");
export const getAccountAddresses = () => accountFetch<any[]>("/account/addresses");
export const createAccountAddress = (payload: Record<string, unknown>) => accountFetch<Record<string, any>>("/account/addresses", { method: "POST", body: JSON.stringify(payload) });
export const updateAccountAddress = (id: string, payload: Record<string, unknown>) => accountFetch<Record<string, any>>(`/account/addresses/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteAccountAddress = (id: string) => accountFetch<{ id: string }>(`/account/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
export const getProfileCompletionRewardStatus = () => getAccountRewards();
export const claimProfileCompletionReward = () => { throw new Error("Profile rewards must be awarded by the server ledger"); };
