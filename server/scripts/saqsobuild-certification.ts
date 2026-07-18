import fs from "fs";
import path from "path";

type Finding = { severity: "BLOCKER" | "RISK"; file: string; rule: string };
const root = path.resolve(process.argv[2] || path.join(__dirname, "../.."));
const findings: Finding[] = [];
const sourceExtensions = new Set([".ts", ".tsx", ".css", ".json"]);
const excluded = new Set(["node_modules", ".next", "dist", ".git"]);

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (excluded.has(entry.name)) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

for (const file of walk(root)) {
  const relative = path.relative(root, file).replace(/\\/g, "/");
  const inactiveArtifact = /(?:\.bak|backup|\/migrated\/|\/dist\/|saqsobuild-certification\.ts$)/i.test(relative);
  if (/\/(\.env|\.env\.)/.test(`/${relative}`) && !relative.endsWith(".env.example")) findings.push({ severity: "RISK", file: relative, rule: "SECRET_BEARING_ENV_IN_SOURCE" });
  if (!sourceExtensions.has(path.extname(file))) continue;
  const text = fs.readFileSync(file, "utf8");
  if (!inactiveArtifact && /guest-checkout-user|01700000000/.test(text)) findings.push({ severity: "BLOCKER", file: relative, rule: "FAKE_CHECKOUT_IDENTITY" });
  if (!inactiveArtifact && /(^|\n)\s*\.grid\s*\{\s*grid-template-columns:\s*1fr\s*!important/.test(text)) findings.push({ severity: "BLOCKER", file: relative, rule: "GLOBAL_MOBILE_GRID_OVERRIDE" });
  if (/\.bak(?:[-_.]|$)|Backup\d*/i.test(relative)) findings.push({ severity: "RISK", file: relative, rule: "BACKUP_SOURCE_ARTIFACT" });
}

const summary = {
  generatedAt: new Date().toISOString(),
  root,
  verdict: findings.some((item) => item.severity === "BLOCKER") ? "FAIL" : "PASS",
  counts: {
    blocker: findings.filter((item) => item.severity === "BLOCKER").length,
    risk: findings.filter((item) => item.severity === "RISK").length,
  },
  findings,
};

console.log(JSON.stringify(summary, null, 2));
if (summary.verdict === "FAIL") process.exitCode = 1;
