import { aiGateway } from "../../core/gateway";
import { aiProviderRegistry } from "../../core/providerRegistry";

function outputText(output: unknown): string {
  if (typeof output === "string") return output;
  if (output && typeof output === "object" && "text" in output) return String((output as any).text ?? "");
  return JSON.stringify(output ?? "");
}
export function providerStatus() {
  return aiProviderRegistry.list().map(p=>({name:p.name,displayName:p.displayName,enabled:p.enabled,supports:p.supports,defaultChatModel:p.defaultModels.chat}));
}
export async function developerConversation(input:{prompt:string;userId?:string;workspaceId?:string;context?:unknown}) {
  const result=await aiGateway.execute<any>({
    feature:"ai_developer_live_chat",modelType:"chat",input:{instruction:input.prompt,projectContext:input.context},
    actor:{userId:input.userId},metadata:{workspaceId:input.workspaceId,mode:"approval-governed",noAutomaticMutation:true}
  });
  return {answer:outputText(result.output),provider:result.provider,model:result.model,status:result.status,usage:result.usage,costUsd:result.estimatedCostUsd,auditId:result.auditId};
}
