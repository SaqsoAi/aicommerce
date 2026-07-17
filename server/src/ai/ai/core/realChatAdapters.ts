import type { AiProviderAdapter, AiProviderName } from "./types";

type ChatRequest = {
  model: { id: string };
  renderedPrompt: string;
  metadata?: Record<string, unknown>;
};

function textFromOpenAi(payload: any): string {
  return payload?.choices?.[0]?.message?.content ?? "";
}
function textFromClaude(payload: any): string {
  return Array.isArray(payload?.content) ? payload.content.map((x: any) => x?.text ?? "").join("\n") : "";
}
function textFromGemini(payload: any): string {
  return payload?.candidates?.[0]?.content?.parts?.map((x: any) => x?.text ?? "").join("\n") ?? "";
}
async function requireJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || body?.message || `Provider request failed (${response.status})`);
  return body;
}
function adapter(name: AiProviderName, invoke: (request: ChatRequest) => Promise<any>): AiProviderAdapter {
  return { name, async invoke(request: any) { return invoke(request as ChatRequest); } };
}

export const openAiChatAdapter = adapter("openai", async ({model, renderedPrompt}) => {
  const response = await fetch(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions", {
    method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},
    body:JSON.stringify({model:model.id,messages:[{role:"user",content:renderedPrompt}],temperature:0.2})
  });
  const body=await requireJson(response);
  return {output:{text:textFromOpenAi(body),raw:body},usage:{inputTokens:body?.usage?.prompt_tokens,outputTokens:body?.usage?.completion_tokens,totalTokens:body?.usage?.total_tokens,requests:1}};
});

export const openRouterChatAdapter = adapter("openrouter", async ({model, renderedPrompt}) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,"HTTP-Referer":process.env.APP_URL || "http://localhost","X-Title":"SAQSO.AI"},
    body:JSON.stringify({model:model.id,messages:[{role:"user",content:renderedPrompt}],temperature:0.2})
  });
  const body=await requireJson(response);
  return {output:{text:textFromOpenAi(body),raw:body},usage:{inputTokens:body?.usage?.prompt_tokens,outputTokens:body?.usage?.completion_tokens,totalTokens:body?.usage?.total_tokens,requests:1}};
});

export const claudeChatAdapter = adapter("claude", async ({model, renderedPrompt}) => {
  const key=process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json","x-api-key":String(key),"anthropic-version":"2023-06-01"},
    body:JSON.stringify({model:model.id,max_tokens:2500,temperature:0.2,messages:[{role:"user",content:renderedPrompt}]})
  });
  const body=await requireJson(response);
  return {output:{text:textFromClaude(body),raw:body},usage:{inputTokens:body?.usage?.input_tokens,outputTokens:body?.usage?.output_tokens,requests:1}};
});

export const geminiChatAdapter = adapter("gemini", async ({model, renderedPrompt}) => {
  const key=process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.id)}:generateContent?key=${encodeURIComponent(String(key))}`, {
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents:[{role:"user",parts:[{text:renderedPrompt}]}],generationConfig:{temperature:0.2}})
  });
  const body=await requireJson(response);
  return {output:{text:textFromGemini(body),raw:body},usage:{inputTokens:body?.usageMetadata?.promptTokenCount,outputTokens:body?.usageMetadata?.candidatesTokenCount,totalTokens:body?.usageMetadata?.totalTokenCount,requests:1}};
});

export const ollamaChatAdapter = adapter("ollama", async ({model, renderedPrompt}) => {
  const response = await fetch(`${String(process.env.OLLAMA_BASE_URL).replace(/\/$/,"")}/api/chat`, {
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:model.id,stream:false,messages:[{role:"user",content:renderedPrompt}]})
  });
  const body=await requireJson(response);
  return {output:{text:body?.message?.content ?? "",raw:body},usage:{inputTokens:body?.prompt_eval_count,outputTokens:body?.eval_count,requests:1}};
});
