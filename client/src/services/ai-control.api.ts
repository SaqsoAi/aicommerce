const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:5000/api";

export type PublicAiFeature = {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
  placement?: string[];
  config?: Record<string, unknown>;
};

export async function getPublicAiAvailability(): Promise<{ features: PublicAiFeature[] }> {
  const response = await fetch(`${API_BASE}/ai-control/public/availability`, {
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    return { features: [] };
  }

  return data?.data ?? { features: [] };
}