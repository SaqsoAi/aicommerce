import { assertStandardPermissionName, permissionMatches } from './permission-naming.util';
import prisma from "../../config/prisma";

export const getPermissionsService =
async () => {
  return prisma.permission.findMany({
    orderBy: {
      code: "asc",
    },
  });
};

export function resolvePermissionInheritance(userPermissions: string[], requiredPermission: string): boolean {
  const required = assertStandardPermissionName(requiredPermission);
  return (userPermissions || []).some((permission) => permissionMatches(permission, required));
}

export function validatePermissionList(permissions: string[]): string[] {
  return Array.from(new Set((permissions || []).map(assertStandardPermissionName)));
}
