import {
  ENTERPRISE_ROLE_HIERARCHY,
  ROLE_INHERITANCE,
  type EnterpriseRoleKey,
  isEnterpriseRole,
  canManageRole,
  isProtectedSystemRole,
} from "./enterprise-role-matrix";

export type RoleValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateRoleKey(role: string): RoleValidationResult {
  if (!isEnterpriseRole(role)) {
    return { valid: false, errors: [`Invalid enterprise role: ${role}`] };
  }
  return { valid: true, errors: [] };
}

export function validateNoDuplicateRoles(roles: string[]): RoleValidationResult {
  const seen = new Set<string>();
  const duplicates = roles.filter((role) => {
    if (seen.has(role)) return true;
    seen.add(role);
    return false;
  });

  return {
    valid: duplicates.length === 0,
    errors: duplicates.map((role) => `Duplicate role detected: ${role}`),
  };
}

export function validateRoleAssignment(actorRole: EnterpriseRoleKey, targetRole: EnterpriseRoleKey): RoleValidationResult {
  if (!canManageRole(actorRole, targetRole)) {
    return {
      valid: false,
      errors: [`Role escalation blocked: ${actorRole} cannot manage ${targetRole}`],
    };
  }

  return { valid: true, errors: [] };
}

export function validateSystemRoleMutation(actorRole: EnterpriseRoleKey, targetRole: EnterpriseRoleKey): RoleValidationResult {
  if (actorRole !== "SUPER_ADMIN") {
    return { valid: false, errors: ["Only SUPER_ADMIN can mutate role hierarchy or system roles."] };
  }

  if (isProtectedSystemRole(targetRole)) {
    return { valid: false, errors: [`Protected system role is locked: ${targetRole}`] };
  }

  return { valid: true, errors: [] };
}

export function validateNoCircularInheritance(): RoleValidationResult {
  const errors: string[] = [];
  const visiting = new Set<EnterpriseRoleKey>();
  const visited = new Set<EnterpriseRoleKey>();

  function visit(role: EnterpriseRoleKey, path: EnterpriseRoleKey[]) {
    if (visiting.has(role)) {
      errors.push(`Circular inheritance detected: ${[...path, role].join(" -> ")}`);
      return;
    }

    if (visited.has(role)) return;

    visiting.add(role);
    for (const child of ROLE_INHERITANCE[role] || []) {
      visit(child, [...path, role]);
    }
    visiting.delete(role);
    visited.add(role);
  }

  for (const role of ENTERPRISE_ROLE_HIERARCHY) visit(role, []);

  return { valid: errors.length === 0, errors };
}
