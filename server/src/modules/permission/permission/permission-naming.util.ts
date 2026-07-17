export type StandardPermissionAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "publish"
  | "export"
  | "import"
  | "adjust"
  | "manage";

export function normalizePermissionName(input: string): string {
  return String(input || "").trim().toLowerCase().replace(/[^a-z0-9:._-]/g, "");
}

export function isStandardPermissionName(input: string): boolean {
  const value = normalizePermissionName(input);
  return /^[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*$/.test(value);
}

export function assertStandardPermissionName(input: string): string {
  const value = normalizePermissionName(input);
  if (!isStandardPermissionName(value)) {
    throw new Error(`Invalid permission name "${input}". Expected resource.action format.`);
  }
  return value;
}

export function permissionMatches(userPermission: string, requiredPermission: string): boolean {
  const userValue = normalizePermissionName(userPermission);
  const requiredValue = normalizePermissionName(requiredPermission);

  if (userValue === "*") return true;
  if (userValue === requiredValue) return true;

  const [requiredResource] = requiredValue.split(".");
  if (userValue === `${requiredResource}.*`) return true;

  return false;
}
