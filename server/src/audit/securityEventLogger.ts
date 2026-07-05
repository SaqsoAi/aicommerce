import { PrismaClient } from "@prisma/client";
import type { Request } from "express";
import type { AuditEventType } from "./auditEventTypes";
import { buildAuditContext, type AuditContext } from "./auditContext";
import { sanitizeAuditMetadata } from "./auditMetadataSanitizer";
import { writeAuditLog } from "./auditLogger";

const prisma = new PrismaClient();

export interface SecurityEventInput {
  eventType: AuditEventType | string;
  action?: string;
  resource?: string;
  resourceId?: string;
  reason?: string;
  metadata?: unknown;
  context?: AuditContext;
  req?: Request;
}

function compact<T extends Record<string, unknown>>(input: T): T {
  for (const key of Object.keys(input)) {
    if (input[key] === undefined || input[key] === null || input[key] === "") {
      delete input[key];
    }
  }
  return input;
}

export async function writeSecurityEvent(input: SecurityEventInput): Promise<void> {
  try {
    const context = { ...buildAuditContext(input.req), ...(input.context ?? {}) };
    const payload = compact({
      eventType: input.eventType,
      action: input.action ?? input.eventType,
      resource: input.resource,
      resourceId: input.resourceId,
      result: "denied",
      reason: input.reason,
      actorId: context.actorId,
      actorRole: context.actorRole,
      tenantId: context.tenantId,
      storeId: context.storeId,
      branchId: context.branchId,
      warehouseId: context.warehouseId,
      ip: context.ip,
      userAgent: context.userAgent,
      requestId: context.requestId,
      metadata: sanitizeAuditMetadata(input.metadata ?? {}),
    });

    await (prisma as any).securityEvent.create({ data: payload });
    await writeAuditLog({ ...input, result: "denied" });
  } catch (error) {
    console.error("[audit] writeSecurityEvent failed", error);
  }
}
