import fs from "fs";
import path from "path";
import crypto from "crypto";

export function automateManagementReport(
  root: string,
  context: {tenantId?: string; storeId?: string; userId: string},
  input: {
    type?: string;
    title?: string;
    summary?: string;
    metrics?: unknown;
    recommendations?: unknown;
  },
) {
  const id = crypto.randomUUID();
  const directory = path.join(
    root,
    "PROJECT_AUDIT",
    "BUSINESS_AI_MANAGEMENT_REPORTS",
    id,
  );
  fs.mkdirSync(directory, {recursive:true});

  const report = {
    id,
    type: String(input.type ?? "MONTHLY"),
    title: String(input.title ?? "Management Report"),
    tenantId: context.tenantId,
    storeId: context.storeId,
    generatedBy: context.userId,
    generatedAt: new Date().toISOString(),
    summary: String(input.summary ?? ""),
    metrics: input.metrics ?? {},
    recommendations: input.recommendations ?? [],
  };

  fs.writeFileSync(
    path.join(directory, "report.json"),
    JSON.stringify(report, null, 2),
  );
  fs.writeFileSync(
    path.join(directory, "report.txt"),
    `${report.title}\n\n${report.summary}\n\n${JSON.stringify(report.metrics, null, 2)}`,
  );

  return {
    ...report,
    directory,
    formats: ["JSON", "TXT", "BROWSER_PRINT"],
  };
}
