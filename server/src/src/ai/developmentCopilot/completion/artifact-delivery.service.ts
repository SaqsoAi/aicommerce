import fs from "fs";
import path from "path";
import crypto from "crypto";

export function createArtifact(root: string, input: Record<string, unknown>) {
  const id = crypto.randomUUID();
  const dir = path.join(root, "PROJECT_AUDIT", "AI_BUILDER_ARTIFACTS", id);
  fs.mkdirSync(dir, { recursive: true });
  const artifact = { id, kind: String(input.kind ?? "PLAN"), name: String(input.name ?? "artifact"), status: "DRAFT", content: input.content ?? {}, createdAt: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, "artifact.json"), JSON.stringify(artifact, null, 2));
  return { ...artifact, path: dir };
}
export function createPluginBlueprint(root: string, input: Record<string, any>) {
  return createArtifact(root, { kind: "PLUGIN_BLUEPRINT", name: input.name, content: { manifest: { schemaVersion: "1.0", pluginKey: input.pluginKey, version: input.version ?? "1.0.0", files: input.files ?? [], databaseChanges: { hasChanges: false } }, validation: ["declare every archive file", "sha256 every payload file", "database changes through PS1 only"] } });
}
