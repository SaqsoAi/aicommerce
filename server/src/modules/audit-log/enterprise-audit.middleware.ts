import type { Request } from "express";
import { ENTERPRISE_AUDIT_EVENTS, writeEnterpriseSecurityEvent } from "./enterprise-audit.service";

export async function auditUnauthorized(req: Request, resource: string, reason = "Unauthorized access") {
  await writeEnterpriseSecurityEvent({
    req,
    eventType: ENTERPRISE_AUDIT_EVENTS.unauthorized_access,
    resource,
    reason,
  });
}

export async function auditPermissionDenied(req: Request, resource: string, reason = "Permission denied") {
  await writeEnterpriseSecurityEvent({
    req,
    eventType: ENTERPRISE_AUDIT_EVENTS.permission_denied,
    resource,
    reason,
  });
}

export async function auditScopeDenied(req: Request, eventType: string, resource: string, reason: string) {
  await writeEnterpriseSecurityEvent({
    req,
    eventType,
    resource,
    reason,
  });
}
