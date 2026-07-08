import { AiAuditRecord } from "./types";

const auditRecords: AiAuditRecord[] = [];

function id(): string {
  return `ai_audit_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const aiAuditEngine = {
  record(input: Omit<AiAuditRecord, "id" | "at">): AiAuditRecord {
    const record: AiAuditRecord = { id: id(), at: new Date().toISOString(), ...input };
    auditRecords.push(record);
    if (auditRecords.length > 5000) auditRecords.splice(0, auditRecords.length - 5000);
    return record;
  },
  list(filter?: Partial<Pick<AiAuditRecord, "tenantId" | "userId" | "provider" | "feature" | "status">>): AiAuditRecord[] {
    return auditRecords.filter((record) => {
      if (!filter) return true;
      return Object.entries(filter).every(([k, v]) => v === undefined || (record as unknown as Record<string, unknown>)[k] === v);
    });
  },
};