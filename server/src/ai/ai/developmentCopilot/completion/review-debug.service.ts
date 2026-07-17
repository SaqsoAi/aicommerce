import fs from "fs";

export type ReviewFinding = {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  file: string;
  message: string;
  evidence?: string;
};

export function reviewSource(file: string) {
  const text = fs.readFileSync(file, "utf8");
  const findings: ReviewFinding[] = [];
  const add = (severity: ReviewFinding["severity"], category: string, message: string, evidence?: string) =>
    findings.push({ id: `${category}-${findings.length + 1}`, severity, category, file, message, evidence });

  if (/:\s*any\b/.test(text)) add("MEDIUM", "TYPE_SAFETY", "Explicit any types detected");
  if (/console\.log/.test(text)) add("LOW", "LOGGING", "console.log found");
  if (/dangerouslySetInnerHTML/.test(text)) add("HIGH", "XSS", "dangerouslySetInnerHTML requires sanitization");
  if (/localStorage\.getItem\(["']token/.test(text)) add("LOW", "AUTH", "Browser token access detected; verify centralized client");
  return { file, lines: text.split(/\r?\n/).length, findings };
}

export function debugLog(log: string) {
  const rules: Array<[RegExp, string]> = [
    [/Cannot find module ['"]([^'"]+)/, "MISSING_IMPORT"],
    [/implicitly has an ['"]any['"]/, "TYPE_ANNOTATION"],
    [/Prisma.*Unknown argument/, "PRISMA_CONTRACT"],
    [/\b401\b|Unauthorized/, "AUTHENTICATION"],
    [/\b403\b|Forbidden/, "AUTHORIZATION"],
  ];
  const hit = rules.find(([rule]) => rule.test(log));
  return {
    category: hit?.[1] ?? "GENERAL",
    summary: log.split(/\r?\n/).slice(-20).join("\n"),
    recommended: ["Locate the first source error", "Inspect ownership and imports", "Generate an exact diff", "Rebuild the affected application"],
  };
}
