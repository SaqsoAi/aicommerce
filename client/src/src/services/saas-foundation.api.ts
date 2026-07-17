const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000/api";

export type PublicFeatureFlag = {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
  scope: string;
  config?: Record<string, unknown>;
};

export async function getPublicFeatureFlags(): Promise<{ flags: PublicFeatureFlag[] }> {
  const response = await fetch(`${API_BASE}/saas-foundation/public/features`, {
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    return { flags: [] };
  }

  return data?.data ?? { flags: [] };
}