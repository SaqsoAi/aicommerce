export type CopilotMode = "developer" | "architect" | "review" | "debug" | "performance" | "security" | "planner" | "documentation";

export type CopilotRole =
  | "AI_SOFTWARE_ARCHITECT"
  | "AI_FULL_STACK_DEVELOPER"
  | "AI_REACT_DEVELOPER"
  | "AI_BACKEND_DEVELOPER"
  | "AI_DATABASE_ENGINEER"
  | "AI_SECURITY_EXPERT"
  | "AI_PERFORMANCE_ENGINEER"
  | "AI_BUG_DETECTOR"
  | "AI_CODE_REVIEWER"
  | "AI_REFACTORING_EXPERT"
  | "AI_DOCUMENTATION_GENERATOR"
  | "AI_TEST_GENERATOR"
  | "AI_DEVOPS_ENGINEER"
  | "AI_UI_UX_AUDITOR";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function safeJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`AI Development Copilot request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function getCopilotHealth() {
  return safeJson(`${API_BASE}/ai-development-copilot/health`);
}

export function getCopilotProjectIndex() {
  return safeJson(`${API_BASE}/ai-development-copilot/project-index`);
}

export function getCopilotSandbox() {
  return safeJson(`${API_BASE}/ai-development-copilot/sandbox`);
}

export function previewCopilotPatch(input: { mode: CopilotMode; role: CopilotRole; prompt: string; module?: string }) {
  return safeJson(`${API_BASE}/ai-development-copilot/preview`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export const COPILOT_LOCKED_UI_NOTICE = "UI design is locked. Functionality only. Preview-only. No auto apply.";
