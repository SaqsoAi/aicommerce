#!/usr/bin/env node
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const directory = process.argv[2] || "./migration-visual-output";
const files = await readdir(directory);
const sourceFiles = files.filter((file) =>
  file.startsWith("source-") && file.endsWith(".json"),
);

function key(node) {
  return [node.tag, node.id, node.className, node.text].join("|");
}

const results = [];
for (const sourceFile of sourceFiles) {
  const suffix = sourceFile.slice("source-".length);
  const migratedFile = `migrated-${suffix}`;
  if (!files.includes(migratedFile)) continue;

  const source = JSON.parse(await readFile(path.join(directory, sourceFile), "utf8"));
  const migrated = JSON.parse(await readFile(path.join(directory, migratedFile), "utf8"));
  const targetMap = new Map(migrated.nodes.map((node) => [key(node), node]));

  let matched = 0;
  let geometry = 0;
  let styleMatches = 0;
  let styleTotal = 0;

  for (const sourceNode of source.nodes) {
    const target = targetMap.get(key(sourceNode));
    if (!target) continue;
    matched += 1;

    const close = ["x", "y", "width", "height"].every(
      (name) => Math.abs(sourceNode.rect[name] - target.rect[name]) <= 2,
    );
    if (close) geometry += 1;

    for (const [name, value] of Object.entries(sourceNode.styles)) {
      styleTotal += 1;
      if (target.styles[name] === value) styleMatches += 1;
    }
  }

  const domScore = source.nodes.length
    ? (matched / source.nodes.length) * 100
    : 0;
  const geometryScore = matched ? (geometry / matched) * 100 : 0;
  const computedStyleScore = styleTotal ? (styleMatches / styleTotal) * 100 : 0;
  const overflow = migrated.document.scrollWidth > migrated.viewport.width + 2;

  results.push({
    viewport: source.viewport,
    domScore: Number(domScore.toFixed(2)),
    geometryScore: Number(geometryScore.toFixed(2)),
    computedStyleScore: Number(computedStyleScore.toFixed(2)),
    overflow,
    status:
      domScore >= 95 &&
      geometryScore >= 92 &&
      computedStyleScore >= 95 &&
      !overflow
        ? "PASS"
        : "BLOCKED",
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  results,
  status: results.length && results.every((item) => item.status === "PASS")
    ? "PASS"
    : "BLOCKED",
};

await writeFile(
  path.join(directory, "dom-computed-style-report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exit(1);
