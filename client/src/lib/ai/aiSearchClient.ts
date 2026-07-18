export type AiSearchRequest = Record<string, unknown>;

import { getPublicAiAvailability } from "@/services/ai-control.api";

async function postAiSearch(path: string, body: AiSearchRequest) {
  const tenantId = typeof body.tenantId === "string" ? body.tenantId : undefined;
  const storeId = typeof body.storeId === "string" ? body.storeId : undefined;
  const availability = await getPublicAiAvailability({ tenantId, storeId });
  if (!availability.features.some((feature) => feature.key === "smart_search" && feature.enabled)) {
    throw new Error("AI smart search is disabled for this store");
  }
  const response = await fetch(`/api/backend/ai/search/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`AI search request failed: ${response.status}`);
  }

  return response.json();
}

export const aiSearchClient = {
  semantic(body: AiSearchRequest) {
    return postAiSearch("semantic", body);
  },
  similar(body: AiSearchRequest) {
    return postAiSearch("similar", body);
  },
  imageFoundation(body: AiSearchRequest) {
    return postAiSearch("image-foundation", body);
  },
  ocrFoundation(body: AiSearchRequest) {
    return postAiSearch("ocr-foundation", body);
  },
  voiceFoundation(body: AiSearchRequest) {
    return postAiSearch("voice-foundation", body);
  },
};
