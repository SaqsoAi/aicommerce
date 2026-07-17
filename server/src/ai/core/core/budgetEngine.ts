import { AiBudgetPolicy, AiUsageRecord } from "./types";
import { aiUsageEngine } from "./usageEngine";

const policies: AiBudgetPolicy[] = [
  { scope: "global", scopeId: "default", dailyUsd: Number(process.env.AI_DAILY_BUDGET_USD || 0) || undefined, monthlyUsd: Number(process.env.AI_MONTHLY_BUDGET_USD || 0) || undefined, enabled: true },
];

function inWindow(record: AiUsageRecord, days: number): boolean {
  const at = new Date(record.at).getTime();
  return at >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export const aiBudgetEngine = {
  register(policy: AiBudgetPolicy): void {
    const index = policies.findIndex((p) => p.scope === policy.scope && p.scopeId === policy.scopeId);
    if (index >= 0) policies[index] = policy;
    else policies.push(policy);
  },
  list(): AiBudgetPolicy[] {
    return [...policies];
  },
  assertAllowed(context: { tenantId?: string; feature: string; provider: string }): void {
    for (const policy of policies.filter((p) => p.enabled)) {
      const records = aiUsageEngine.list().filter((record) => {
        if (policy.scope === "tenant") return record.tenantId === policy.scopeId;
        if (policy.scope === "feature") return record.feature === policy.scopeId;
        if (policy.scope === "provider") return record.provider === policy.scopeId;
        return true;
      });

      const daily = records.filter((record) => inWindow(record, 1));
      const monthly = records.filter((record) => inWindow(record, 31));
      const dailyCost = daily.reduce((sum, row) => sum + row.estimatedCostUsd, 0);
      const monthlyCost = monthly.reduce((sum, row) => sum + row.estimatedCostUsd, 0);
      const dailyRequests = daily.reduce((sum, row) => sum + row.tokens.requests, 0);
      const monthlyRequests = monthly.reduce((sum, row) => sum + row.tokens.requests, 0);

      if (policy.dailyUsd !== undefined && dailyCost >= policy.dailyUsd) throw new Error(`AI daily budget exceeded for ${policy.scope}:${policy.scopeId}`);
      if (policy.monthlyUsd !== undefined && monthlyCost >= policy.monthlyUsd) throw new Error(`AI monthly budget exceeded for ${policy.scope}:${policy.scopeId}`);
      if (policy.dailyRequests !== undefined && dailyRequests >= policy.dailyRequests) throw new Error(`AI daily request budget exceeded for ${policy.scope}:${policy.scopeId}`);
      if (policy.monthlyRequests !== undefined && monthlyRequests >= policy.monthlyRequests) throw new Error(`AI monthly request budget exceeded for ${policy.scope}:${policy.scopeId}`);
    }
  },
};