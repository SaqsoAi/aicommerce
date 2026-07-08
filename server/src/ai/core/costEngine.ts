import { AiProviderConfig, AiTokenUsage } from "./types";

export const aiCostEngine = {
  estimate(provider: AiProviderConfig, usage: AiTokenUsage): number {
    const input = provider.costPer1kInputUsd || 0;
    const output = provider.costPer1kOutputUsd || 0;
    const value = (usage.inputTokens / 1000) * input + (usage.outputTokens / 1000) * output;
    return Number(value.toFixed(8));
  },
};