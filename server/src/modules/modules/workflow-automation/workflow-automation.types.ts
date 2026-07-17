export type WorkflowStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type WorkflowExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "ROLLED_BACK";

export const WORKFLOW_NODE_TYPES = [
  "START",
  "END",
  "BUSINESS_EVENT",
  "CONDITION",
  "DELAY",
  "WAIT",
  "EMAIL",
  "SMS",
  "WHATSAPP",
  "PUSH",
  "NOTIFICATION",
  "AI_PROMPT",
  "HTTP_REQUEST",
  "DATABASE_ACTION",
  "LOOP",
  "PARALLEL",
  "MERGE",
] as const;

export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPES)[number];
