import { AiPromptTemplate } from "./types";

const prompts = new Map<string, AiPromptTemplate[]>();

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

function register(prompt: AiPromptTemplate): void {
  const k = normalizeKey(prompt.key);
  const versions = prompts.get(k) || [];
  const next = versions.filter((item) => item.version !== prompt.version);
  next.push(Object.freeze({ ...prompt, variables: [...prompt.variables], metadata: { ...(prompt.metadata || {}) } }));
  next.sort((a, b) => b.version - a.version);
  prompts.set(k, next);
}

function render(template: string, variables: Record<string, unknown> = {}): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, name: string) => {
    const value = variables[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

export const aiPromptRegistry = {
  register,
  list(category?: string): AiPromptTemplate[] {
    return [...prompts.values()].flat().filter((prompt) => !category || prompt.category === category);
  },
  get(key: string, version?: number): AiPromptTemplate | undefined {
    const versions = prompts.get(normalizeKey(key)) || [];
    if (version) return versions.find((prompt) => prompt.version === version);
    return versions.find((prompt) => prompt.approved) || versions[0];
  },
  approved(key: string, version?: number): AiPromptTemplate {
    const prompt = this.get(key, version);
    if (!prompt) throw new Error(`Prompt not found: ${key}`);
    if (!prompt.approved) throw new Error(`Prompt is not approved: ${key}@${prompt.version}`);
    return prompt;
  },
  render,
  rollback(key: string, fromVersion: number, toVersion: number): AiPromptTemplate {
    const target = this.get(key, toVersion);
    if (!target) throw new Error(`Rollback target prompt not found: ${key}@${toVersion}`);
    const next: AiPromptTemplate = {
      ...target,
      version: fromVersion + 1,
      rollbackFromVersion: fromVersion,
      createdAt: new Date().toISOString(),
    };
    register(next);
    return next;
  },
};

register({
  key: "ai.core.default",
  version: 1,
  category: "core",
  title: "Default AI Gateway Prompt",
  approved: true,
  template: "You are an enterprise commerce AI service. Follow safety, privacy, tenant isolation, and RBAC rules. Request: {{input}}",
  variables: ["input"],
  metadata: { phase: "6.1", featureImplementation: false },
  createdAt: new Date().toISOString(),
});