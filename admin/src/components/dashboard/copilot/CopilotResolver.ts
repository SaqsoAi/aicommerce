export function createCopilotContext(role: string, page: string, widgetId?: string) {
  return { role, page, widgetId, timestamp: new Date().toISOString(), safety: "preview-only" };
}
