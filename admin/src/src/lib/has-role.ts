export const hasRole = (
  userRole: string | null | undefined,
  roles: string[] = []
) => {
  const normalizedRole =
    userRole?.toUpperCase?.() || "";

  if (!normalizedRole) {
    return false;
  }

  if (normalizedRole === "SUPER_ADMIN") {
    return true;
  }

  if (normalizedRole === "CUSTOMER") {
    return false;
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }

  return roles
    .map((role) => role.toUpperCase())
    .includes(normalizedRole);
};
