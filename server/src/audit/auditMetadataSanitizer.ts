const BLOCKED_KEYS = [
  "password",
  "pass",
  "token",
  "jwt",
  "authorization",
  "secret",
  "apiKey",
  "apikey",
  "api_key",
  "creditCard",
  "cardNumber",
  "cvv",
  "cvc",
  "prompt",
  "rawPrompt",
  "fullPrompt",
];

function isBlockedKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return BLOCKED_KEYS.some((blocked) => normalized.includes(blocked.toLowerCase()));
}

export function sanitizeAuditMetadata(input: unknown, depth = 0): unknown {
  if (input === null || input === undefined) return input;
  if (depth > 4) return "[MaxDepth]";
  if (typeof input === "string") return input.length > 500 ? `${input.slice(0, 500)}...[truncated]` : input;
  if (typeof input === "number" || typeof input === "boolean") return input;

  if (Array.isArray(input)) {
    return input.slice(0, 25).map((item) => sanitizeAuditMetadata(item, depth + 1));
  }

  if (typeof input === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (isBlockedKey(key)) {
        output[key] = "[REDACTED]";
        continue;
      }
      output[key] = sanitizeAuditMetadata(value, depth + 1);
    }
    return output;
  }

  return "[Unsupported]";
}
