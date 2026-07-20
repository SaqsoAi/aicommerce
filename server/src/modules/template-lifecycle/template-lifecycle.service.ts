import { randomUUID } from "crypto";
import prisma from "../../config/prisma";
import {
  TEMPLATE_CERTIFICATION_GATE_KEYS,
  type CreateTemplateCertificationInput,
  type TemplateActivationEligibility,
  type TemplateCertificationContract,
  type TemplateCertificationGateKey,
  type TemplateCertificationGateResult,
  type TemplateCertificationGateStatus,
} from "./template-lifecycle.types";

const REQUIRED_EXTERNAL_GATES: TemplateCertificationGateKey[] = [
  "SERVER_BUILD",
  "ADMIN_BUILD",
  "CLIENT_BUILD",
  "TENANT_ISOLATION",
  "RESPONSIVE",
  "VISUAL_PARITY",
  "API_BINDING",
  "SECURITY",
];

function normalizeStatus(value: unknown): TemplateCertificationGateStatus {
  const status = String(value || "").toUpperCase();
  if (
    status === "PASS" ||
    status === "FAIL" ||
    status === "BLOCKED" ||
    status === "REVIEW_REQUIRED"
  ) {
    return status;
  }
  return "REVIEW_REQUIRED";
}

function mapCertification(row: any): TemplateCertificationContract {
  const gates = Array.isArray(row?.gates) ? row.gates : [];
  const failedGates = gates
    .filter((gate: any) => gate?.status !== "PASS")
    .map((gate: any) => gate.key) as TemplateCertificationGateKey[];

  return {
    id: row.id,
    templateId: row.templateId ?? null,
    templateSlug: row.templateSlug,
    storeId: row.storeId ?? null,
    status: row.status,
    score: row.score,
    publishReady: row.status === "CERTIFIED" && failedGates.length === 0,
    failedGates,
    gates,
    report:
      row.report && typeof row.report === "object"
        ? row.report
        : {},
    createdAt: row.createdAt.toISOString(),
  };
}

async function lifecycleEvent(input: {
  templateId?: string | null;
  storeId?: string | null;
  assignmentId?: string | null;
  action: string;
  status: string;
  actorId?: string | null;
  reason?: string | null;
  metadata?: unknown;
}) {
  await prisma.templateLifecycleEvent.create({
    data: {
      templateId: input.templateId || null,
      storeId: input.storeId || null,
      assignmentId: input.assignmentId || null,
      action: input.action,
      status: input.status,
      actorId: input.actorId || null,
      reason: input.reason || null,
      metadata: (input.metadata || {}) as any,
    },
  });
}

export async function createTemplateCertification(
  input: CreateTemplateCertificationInput,
  actorId?: string | null,
): Promise<TemplateCertificationContract> {
  const template = await prisma.template.findUnique({
    where: { slug: input.templateSlug },
  });
  if (!template) {
    throw Object.assign(new Error("Template was not found."), {
      statusCode: 404,
      code: "TEMPLATE_NOT_FOUND",
    });
  }

  const registry = await prisma.templateRegistryEntry.findUnique({
    where: { slug: input.templateSlug },
  });

  if (input.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: input.storeId },
      select: { id: true },
    });
    if (!store) {
      throw Object.assign(new Error("Selected store was not found."), {
        statusCode: 404,
        code: "STORE_NOT_FOUND",
      });
    }
  }

  const assignment = input.storeId
    ? await prisma.storeTemplate.upsert({
        where: {
          storeId_templateId: {
            storeId: input.storeId,
            templateId: template.id,
          },
        },
        create: {
          storeId: input.storeId,
          templateId: template.id,
          isActive: false,
        },
        update: {},
        include: {
          store: {
            include: {
              domains: true,
              tenant: true,
            },
          },
        },
      })
    : null;

  const submitted = new Map<
    TemplateCertificationGateKey,
    TemplateCertificationGateResult
  >(
    (input.gates || []).map((gate) => [
      gate.key,
      { ...gate, status: normalizeStatus(gate.status) },
    ]),
  );

  const internalGates: TemplateCertificationGateResult[] = [
    {
      key: "REGISTRY",
      status: registry ? "PASS" : "BLOCKED",
      detail: registry
        ? "Template registry entry exists."
        : "Template registry entry is missing.",
    },
    {
      key: "REGISTRY_HEALTH",
      status: registry?.health === "HEALTHY" ? "PASS" : "BLOCKED",
      detail: `Registry health: ${registry?.health || "MISSING"}.`,
    },
    {
      key: "CODE_PATH",
      status: registry?.codePath ? "PASS" : "REVIEW_REQUIRED",
      detail: registry?.codePath
        ? `Code path: ${registry.codePath}.`
        : "Imported template code path requires verification.",
    },
    {
      key: "MANIFEST",
      status:
        registry?.manifest &&
        typeof registry.manifest === "object" &&
        Object.keys(registry.manifest as object).length > 0
          ? "PASS"
          : "REVIEW_REQUIRED",
      detail: "Registry manifest validation.",
    },
    {
      key: "ACTIVE_ASSIGNMENT",
      status: "PASS",
      detail: input.storeId
        ? assignment?.isActive
          ? "Selected store assignment exists and is active."
          : "Inactive assignment is ready for pre-activation certification; a missing assignment is created automatically."
        : "Global template certification.",
    },
    {
      key: "RUNTIME_DOMAIN",
      status: input.storeId
        ? assignment?.store?.domains?.some(
            (domain) => domain.status === "ACTIVE",
          )
          ? "PASS"
          : "BLOCKED"
        : "PASS",
      detail: input.storeId
        ? "At least one ACTIVE runtime domain is required."
        : "Global template certification.",
    },
  ];

  const gateMap = new Map<
    TemplateCertificationGateKey,
    TemplateCertificationGateResult
  >();

  for (const gate of internalGates) {
    gateMap.set(gate.key, gate);
  }
  for (const key of REQUIRED_EXTERNAL_GATES) {
    gateMap.set(
      key,
      submitted.get(key) || {
        key,
        status: "REVIEW_REQUIRED",
        detail: "External certification evidence was not supplied.",
      },
    );
  }

  const gates = TEMPLATE_CERTIFICATION_GATE_KEYS.map(
    (key) =>
      gateMap.get(key) || {
        key,
        status: "REVIEW_REQUIRED" as const,
        detail: "Gate has not been evaluated.",
      },
  );

  const failed = gates.filter((gate) => gate.status !== "PASS");
  const review = failed.some(
    (gate) => gate.status === "REVIEW_REQUIRED",
  );
  const score = Math.round(
    ((gates.length - failed.length) / gates.length) * 100,
  );
  const status =
    failed.length === 0
      ? "CERTIFIED"
      : review
        ? "REVIEW_REQUIRED"
        : "BLOCKED";

  const saved = await prisma.templateCertification.create({
    data: {
      id: randomUUID(),
      templateId: template.id,
      templateSlug: template.slug,
      storeId: input.storeId || null,
      status,
      score,
      gates: gates as any,
      report: {
        ...(input.report || {}),
        failedGates: failed.map((gate) => gate.key),
        publishReady: failed.length === 0,
      } as any,
    },
  });

  await lifecycleEvent({
    templateId: template.id,
    storeId: input.storeId || null,
    assignmentId: assignment?.id || null,
    action: "CERTIFY",
    status,
    actorId,
    metadata: {
      certificationId: saved.id,
      score,
      failedGates: failed.map((gate) => gate.key),
    },
  });

  return mapCertification(saved);
}

export async function listTemplateCertifications(input: {
  templateSlug: string;
  storeId?: string;
  take?: number;
}): Promise<TemplateCertificationContract[]> {
  const rows = await prisma.templateCertification.findMany({
    where: {
      templateSlug: input.templateSlug,
      ...(input.storeId ? { storeId: input.storeId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(input.take || 50, 1), 100),
  });
  return rows.map(mapCertification);
}

export async function getLatestTemplateCertification(input: {
  templateSlug: string;
  storeId?: string;
}): Promise<TemplateCertificationContract | null> {
  const row = await prisma.templateCertification.findFirst({
    where: {
      templateSlug: input.templateSlug,
      ...(input.storeId ? { storeId: input.storeId } : {}),
      status: { not: "REVOKED" },
    },
    orderBy: { createdAt: "desc" },
  });
  return row ? mapCertification(row) : null;
}

export async function revokeTemplateCertification(input: {
  id: string;
  actorId?: string | null;
  reason?: string | null;
}): Promise<TemplateCertificationContract> {
  const existing = await prisma.templateCertification.findUnique({
    where: { id: input.id },
  });
  if (!existing) {
    throw Object.assign(new Error("Certification was not found."), {
      statusCode: 404,
      code: "CERTIFICATION_NOT_FOUND",
    });
  }

  const updated = await prisma.templateCertification.update({
    where: { id: input.id },
    data: {
      status: "REVOKED",
      report: {
        ...((existing.report as Record<string, unknown>) || {}),
        revokedAt: new Date().toISOString(),
        revokedBy: input.actorId || null,
        revokeReason: input.reason || null,
        publishReady: false,
      } as any,
    },
  });

  await lifecycleEvent({
    templateId: existing.templateId,
    storeId: existing.storeId,
    action: "CERTIFICATION_REVOKE",
    status: "REVOKED",
    actorId: input.actorId,
    reason: input.reason,
    metadata: { certificationId: existing.id },
  });

  return mapCertification(updated);
}

export async function evaluateTemplateActivation(
  assignmentId: string,
): Promise<TemplateActivationEligibility> {
  const assignment = await prisma.storeTemplate.findUnique({
    where: { id: assignmentId },
    include: {
      template: true,
      store: {
        include: {
          domains: true,
          tenant: true,
        },
      },
    },
  });

  if (!assignment) {
    throw Object.assign(new Error("Template assignment was not found."), {
      statusCode: 404,
      code: "ASSIGNMENT_NOT_FOUND",
    });
  }

  const registry = await prisma.templateRegistryEntry.findUnique({
    where: { slug: assignment.template.slug },
  });
  if (registry?.health !== "HEALTHY") {
    return {
      eligible: false,
      code: "REGISTRY_NOT_HEALTHY",
      message: "Template registry health must be HEALTHY.",
      certification: null,
    };
  }

  const latest =
    (await getLatestTemplateCertification({
      templateSlug: assignment.template.slug,
      storeId: assignment.storeId,
    })) ||
    (await getLatestTemplateCertification({
      templateSlug: assignment.template.slug,
    }));

  if (!latest) {
    return {
      eligible: false,
      code: "CERTIFICATION_MISSING",
      message: "Template certification is required before activation.",
      certification: null,
    };
  }

  if (latest.status !== "CERTIFIED" || !latest.publishReady) {
    return {
      eligible: false,
      code: "CERTIFICATION_NOT_READY",
      message: "Latest template certification is not publish-ready.",
      certification: latest,
    };
  }

  const runtimeReady =
    assignment.store.status === "ACTIVE" &&
    assignment.store.storefrontEnabled &&
    assignment.store.tenant?.status === "ACTIVE" &&
    assignment.store.tenant?.storefrontEnabled &&
    assignment.store.domains.some(
      (domain) => domain.status === "ACTIVE",
    );

  if (!runtimeReady) {
    return {
      eligible: false,
      code: "RUNTIME_NOT_READY",
      message:
        "Tenant, store and at least one runtime domain must be ACTIVE.",
      certification: latest,
    };
  }

  return {
    eligible: true,
    code: "PASS",
    message: "Template is eligible for activation.",
    certification: latest,
  };
}
