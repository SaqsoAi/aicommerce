export {
  ENTERPRISE_ROLE_HIERARCHY,
  ENTERPRISE_PERMISSION_MATRIX,
  ROLE_INHERITANCE,
  ROLE_RANK,
  PROTECTED_SYSTEM_ROLES,
  type EnterpriseRoleKey,
  isEnterpriseRole,
  canManageRole,
  isProtectedSystemRole,
} from "./enterprise-role-matrix";

export {
  validateRoleKey,
  validateNoDuplicateRoles,
  validateRoleAssignment,
  validateSystemRoleMutation,
  validateNoCircularInheritance,
  type RoleValidationResult,
} from "./enterprise-role-validator";

export {
  resolveInheritedRoles,
  resolveRolePermissions,
  roleHasPermission,
} from "./enterprise-role-resolver";
