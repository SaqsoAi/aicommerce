export const aiSearchPlatformNotes = {
  phase: "6.3",
  gatewayOnly: true,
  providerDetailsHiddenFromClient: true,
  routes: [
    "/api/ai/search/semantic",
    "/api/ai/search/similar",
    "/api/ai/search/image-foundation",
    "/api/ai/search/ocr-foundation",
    "/api/ai/search/voice-foundation",
  ],
  adminUiPolicy: "No redesign in Phase 6.3; reuse existing AI Search, Prompt Management, Usage, Cost, and Feature Flags pages.",
};
