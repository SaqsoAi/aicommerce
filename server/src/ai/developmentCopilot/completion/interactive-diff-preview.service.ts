import fs from "fs";
import path from "path";

export function interactivePreview(root: string, input: {
  file?: string;
  next?: string;
}) {
  const relative = String(input.file ?? "");
  const target = path.resolve(root, relative);
  if (!target.startsWith(path.resolve(root))) {
    throw new Error("File must be inside the project root.");
  }

  const before = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  const after = String(input.next ?? "");
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const max = Math.max(beforeLines.length, afterLines.length);

  const changes = Array.from({length:max}, (_,index) => {
    const previous = beforeLines[index] ?? "";
    const next = afterLines[index] ?? "";
    return {
      line: index + 1,
      before: previous,
      after: next,
      changed: previous !== next,
    };
  }).filter((entry) => entry.changed);

  return {
    file: relative,
    changedLines: changes.length,
    changes,
    impact: {
      sourceOnly: true,
      databaseChange: false,
      autoApply: false,
      approvalRequired: true,
    },
  };
}
