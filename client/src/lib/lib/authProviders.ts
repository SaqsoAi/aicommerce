export type AuthProviderSetting = {
  id: string;
  key: string;
  value: string;
};

export type AuthProvider = {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  required: boolean;
  settings?: AuthProviderSetting[];
};

export async function getAuthProviders(): Promise<AuthProvider[]> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const res = await fetch(`${base}/auth-providers`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.providers || [];
}

export function isProviderEnabled(providers: AuthProvider[], key: string) {
  return providers.some((provider) => provider.key === key && provider.enabled);
}

export function isProviderRequired(providers: AuthProvider[], key: string) {
  return providers.some((provider) => provider.key === key && provider.required);
}