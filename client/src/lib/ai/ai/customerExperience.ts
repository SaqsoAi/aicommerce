export type AiCustomerExperienceEndpoint =
  | "shopping-assistant"
  | "stylist"
  | "outfit-builder"
  | "size-recommendation"
  | "budget-shopping"
  | "gift-finder"
  | "occasion"
  | "face-shape"
  | "skin-tone";

export interface AiCustomerExperienceClientOptions {
  endpoint: AiCustomerExperienceEndpoint;
  payload: Record<string, unknown>;
  token?: string;
}

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
}

export async function requestAiCustomerExperience<T = unknown>(options: AiCustomerExperienceClientOptions): Promise<T> {
  const response = await fetch(`${apiBase()}/ai/customer-experience/${options.endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify(options.payload),
  });

  const json = await response.json().catch(() => null) as { success?: boolean; data?: T; message?: string } | null;
  if (!response.ok || !json?.success) {
    throw new Error(json?.message || "AI customer experience request failed");
  }
  return json.data as T;
}