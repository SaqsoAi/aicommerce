export type PluginGuidanceState =
  | "NOT_INSTALLED"
  | "PENDING_SETUP"
  | "READY_TO_ACTIVATE"
  | "ACTIVE"
  | "INACTIVE"
  | "DEGRADED"
  | "BLOCKED";

export interface PluginGuidanceAction {
  label: string;
  instruction: string;
  href?: string;
}

export interface PluginGuidance {
  pluginKey: string;
  pluginName: string;
  lifecycleStatus: string;
  guidanceState: PluginGuidanceState;
  title: string;
  summary: string;
  instruction: string;
  documentationHref?: string;
  action?: PluginGuidanceAction;
  blockers: string[];
  updatedAt: string;
}
