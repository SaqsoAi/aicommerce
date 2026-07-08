import { AiRequestStatus, AiTokenUsage, AiUsageRecord } from "./types";

const usageRecords: AiUsageRecord[] = [];

function id(): string {
  return `ai_usage_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const aiUsageEngine = {
  record(input: Omit<AiUsageRecord, "id" | "at">): AiUsageRecord {
    const record: AiUsageRecord = { id: id(), at: new Date().toISOString(), ...input };
    usageRecords.push(record);
    if (usageRecords.length > 5000) usageRecords.splice(0, usageRecords.length - 5000);
    return record;
  },
  list(filter?: Partial<Pick<AiUsageRecord, "tenantId" | "userId" | "provider" | "feature" | "status">>): AiUsageRecord[] {
    return usageRecords.filter((record) => {
      if (!filter) return true;
      return Object.entries(filter).every(([k, v]) => v === undefined || (record as unknown as Record<string, unknown>)[k] === v);
    });
  },
  summarize(filter?: Partial<Pick<AiUsageRecord, "tenantId" | "userId" | "provider" | "feature" | "status">>): AiTokenUsage & { estimatedCostUsd: number; latencyMs: number; statuses: Record<AiRequestStatus, number> } {
    const rows = this.list(filter);
    return rows.reduce(
      (acc, row) => {
        acc.inputTokens += row.tokens.inputTokens;
        acc.outputTokens += row.tokens.outputTokens;
        acc.totalTokens += row.tokens.totalTokens;
        acc.requests += row.tokens.requests;
        acc.estimatedCostUsd += row.estimatedCostUsd;
        acc.latencyMs += row.latencyMs;
        acc.statuses[row.status] = (acc.statuses[row.status] || 0) + 1;
        return acc;
      },
      { inputTokens: 0, outputTokens: 0, totalTokens: 0, requests: 0, estimatedCostUsd: 0, latencyMs: 0, statuses: {} as Record<AiRequestStatus, number> }
    );
  },
};