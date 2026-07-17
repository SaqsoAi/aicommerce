export function canAccessWidget(userPermissions: string[] | undefined, permission?: string) {
  if (!permission) return true;
  if (!userPermissions || userPermissions.length === 0) return true;
  return userPermissions.includes(permission) || userPermissions.includes("*");
}
