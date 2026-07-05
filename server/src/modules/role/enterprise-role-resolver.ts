import {
  ENTERPRISE_PERMISSION_MATRIX,
  ROLE_INHERITANCE,
  type EnterpriseRoleKey,
  isEnterpriseRole,
} from "./enterprise-role-matrix";

export function resolveInheritedRoles(role: EnterpriseRoleKey): EnterpriseRoleKey[] {
  const resolved: EnterpriseRoleKey[] = [];
  const queue: EnterpriseRoleKey[] = [...ROLE_INHERITANCE[role]];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || resolved.includes(current)) continue;
    resolved.push(current);
    queue.push(...ROLE_INHERITANCE[current]);
  }

  return resolved;
}

export function resolveRolePermissions(role: string | null | undefined, directPermissions: string[] = []): string[] {
  if (!isEnterpriseRole(role)) return [...new Set(directPermissions)];

  const inheritedRoles = resolveInheritedRoles(role);
  const matrixPermissions = [
    ...ENTERPRISE_PERMISSION_MATRIX[role],
    ...inheritedRoles.flatMap((inheritedRole) => ENTERPRISE_PERMISSION_MATRIX[inheritedRole] || []),
  ];

  return [...new Set([...matrixPermissions, ...directPermissions])].sort();
}

export function roleHasPermission(role: string | null | undefined, permission: string, directPermissions: string[] = []): boolean {
  return resolveRolePermissions(role, directPermissions).includes(permission);
}
