import { AiGatewayRequest, AiSafetyResult } from "./types";

const injectionPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /developer\s+message/i,
  /system\s+prompt/i,
  /jailbreak/i,
  /do\s+anything\s+now/i,
  /bypass\s+(safety|policy|rules)/i,
  /reveal\s+(secrets|api\s*keys|tokens|credentials)/i,
];

const piiPatterns = [
  /\b\d{13,19}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?\d{1,3}[-.\s]?)?(?:\d{10,14})\b/,
];

function stringify(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export const aiSafetyEngine = {
  inspect(request: AiGatewayRequest): AiSafetyResult {
    const text = stringify({ input: request.input, variables: request.variables, metadata: request.metadata });
    const flags: string[] = [];

    for (const pattern of injectionPatterns) {
      if (pattern.test(text)) flags.push("prompt_injection");
    }

    for (const pattern of piiPatterns) {
      if (pattern.test(text)) flags.push("possible_pii");
    }

    if (text.length > 200000) flags.push("abuse_large_payload");
    if (!request.feature || request.feature.trim().length < 2) flags.push("missing_feature");

    const hardBlock = flags.includes("prompt_injection") || flags.includes("abuse_large_payload") || flags.includes("missing_feature");
    return {
      allowed: !hardBlock,
      reason: hardBlock ? `Blocked by AI Safety Engine: ${[...new Set(flags)].join(", ")}` : undefined,
      flags: [...new Set(flags)],
    };
  },

  redact(value: unknown): string {
    return stringify(value)
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
      .replace(/\b\d{13,19}\b/g, "[REDACTED_NUMBER]")
      .slice(0, 4000);
  },
};