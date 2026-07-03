"use client";

import {
  useEffect,
} from "react";

interface Props {
  roles: string[];
  children: React.ReactNode;
}

export default function RoleGuard({
  roles,
  children,
}: Props) {
  useEffect(() => {
    const role =
      localStorage.getItem(
        "role"
      );

    if (
      !role ||
      !roles.includes(role)
    ) {
      window.location.href =
        "/dashboard";
    }
  }, [roles]);

  return <>{children}</>;
}