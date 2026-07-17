"use client";

import { ReactNode } from "react";

import { UserRole } from "@/types/role";

interface Props {
  children: ReactNode;
  allowedRoles: UserRole[];
  currentRole: UserRole;
}

export default function RoleGuard({
  children,
  allowedRoles,
  currentRole,
}: Props) {
  const hasAccess =
    allowedRoles.includes(
      currentRole
    );

  if (!hasAccess) {
    return (
      <div className="p-10 text-center">
        Access Denied
      </div>
    );
  }

  return <>{children}</>;
}

