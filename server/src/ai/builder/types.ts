export type AiBuilderLanguage = "bn" | "en" | "mixed";
export type AiBuilderIntent =
  | "ARCHITECTURE" | "DEVELOPMENT" | "CODE_REVIEW" | "DEBUG"
  | "REFACTOR" | "DOCUMENTATION" | "PLUGIN" | "DATABASE"
  | "TEMPLATE" | "DEPLOYMENT" | "GENERAL";

export type AiBuilderScope = "PLATFORM" | "SERVER" | "ADMIN" | "CLIENT" | "DATABASE" | "PLUGIN";

export interface AiBuilderPrompt {
  prompt: string;
  language: AiBuilderLanguage;
  intent: AiBuilderIntent;
  scopes: AiBuilderScope[];
}

export interface AiBuilderArtifact {
  kind: "PLAN" | "PLUGIN_MANIFEST" | "POWERSHELL" | "CODE_REVIEW" | "DOCUMENTATION" | "TEMPLATE_BLUEPRINT";
  title: string;
  content: string;
  fileName?: string;
}

export interface AiBuilderAnswer {
  language: AiBuilderLanguage;
  intent: AiBuilderIntent;
  title: string;
  summary: string;
  steps: string[];
  evidence: string[];
  risks: string[];
  artifacts: AiBuilderArtifact[];
  requiresApproval: boolean;
  autoApplied: false;
}
