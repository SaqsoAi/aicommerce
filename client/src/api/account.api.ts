export type AccountApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api";

function normalizeBase(base: string) {
  return base.replace(/\/$/, "");
}

async function accountFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = normalizeBase(DEFAULT_API_BASE);
  const url = `${base}${path}`;
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Account API failed: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as AccountApiResponse<T>;
  return json.data;
}

export async function getAccountDashboard(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return accountFetch<Record<string, any>>(`/account/dashboard${query}`);
}

export async function getAccountProfile(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return accountFetch<Record<string, any>>(`/account/profile${query}`);
}

export async function getAccountOrders(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return accountFetch<any[]>(`/account/orders${query}`);
}

export async function getAccountWishlist(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return accountFetch<any[]>(`/account/wishlist${query}`);
}

export async function getAccountRewards(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return accountFetch<Record<string, any>>(`/account/rewards${query}`);
}

export async function getAccountMembership(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return accountFetch<Record<string, any> | null>(`/account/membership${query}`);
}

export async function getAccountAddresses(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return accountFetch<any[]>(`/account/addresses${query}`);
}
export async function getProfileCompletionRewardStatus(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return accountFetch<Record<string, any>>(`/account/profile-completion-reward${query}`);
}

export async function claimProfileCompletionReward(payload?: Record<string, any>) {
  return accountFetch<Record<string, any>>(`/account/profile-completion-reward/claim`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}
