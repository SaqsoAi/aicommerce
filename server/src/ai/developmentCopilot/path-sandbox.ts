import path from "path";

export function resolveInsideRoot(root: string, candidate: unknown): string {
  const absoluteRoot = path.resolve(root);
  const requested = String(candidate ?? "").trim();
  if (!requested) throw new Error("A workspace-relative file path is required");
  if (path.isAbsolute(requested)) throw new Error("Absolute paths are not allowed");
  const resolved = path.resolve(absoluteRoot, requested);
  const relative = path.relative(absoluteRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Path escapes the approved workspace");
  return resolved;
}
