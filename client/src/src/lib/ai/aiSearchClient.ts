export type AiSearchRequest = Record<string, unknown>;

async function postAiSearch(path: string, body: AiSearchRequest) {
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
