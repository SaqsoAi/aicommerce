export const TEMPLATE_CERTIFICATION_GATE_KEYS = [
  "REGISTRY",
  "REGISTRY_HEALTH",
  "CODE_PATH",
  "MANIFEST",
  "SERVER_BUILD",
  "ADMIN_BUILD",
  "CLIENT_BUILD",
  "TENANT_ISOLATION",
  "RUNTIME_DOMAIN",
  "ACTIVE_ASSIGNMENT",
  "RESPONSIVE",
  "VISUAL_PARITY",
  "API_BINDING",
  "SECURITY",
] as const;

export type TemplateCertificationGateKey =
  (typeof TEMPLATE_CERTIFICATION_GATE_KEYS)[number];

export type TemplateCertificationGateStatus =
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "REVIEW_REQUIRED";

export type TemplateCertificationGateResult = {
  key: TemplateCertificationGateKey;
  status: TemplateCertificationGateStatus;
  score?: number;
  detail?: string;
  artifactPath?: string;
};

export type CreateTemplateCertificationInput = {
  templateSlug: string;
  storeId?: string;
  gates?: TemplateCertificationGateResult[];
  report?: Record<string, unknown>;
};

export type TemplateCertificationStatus =
  | "CERTIFIED"
  | "BLOCKED"
  | "REVIEW_REQUIRED"
  | "REVOKED";

export type TemplateCertificationContract = {
  id: string;
  templateId: string | null;
  templateSlug: string;
  storeId: string | null;
  status: TemplateCertificationStatus;
  score: number;
  publishReady: boolean;
  failedGates: TemplateCertificationGateKey[];
  gates: TemplateCertificationGateResult[];
  report: Record<string, unknown>;
  createdAt: string;
};

export type TemplateActivationEligibility = {
  eligible: boolean;
  code:
    | "PASS"
    | "REGISTRY_NOT_HEALTHY"
    | "CERTIFICATION_MISSING"
    | "CERTIFICATION_NOT_READY"
    | "RUNTIME_NOT_READY";
  message: string;
  certification: TemplateCertificationContract | null;
};
