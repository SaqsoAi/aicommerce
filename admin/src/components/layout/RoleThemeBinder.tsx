"use client";

import { useEffect } from "react";
import { readAdminSession, subscribeAdminSession } from "@/config/adminAccess.registry";

export default function RoleThemeBinder() {
  useEffect(() => {
    const bind = () => {
      const role = readAdminSession().role;
      document.documentElement.dataset.role = role;
      document.documentElement.dataset.app = "admin";
    };
    bind();
    return subscribeAdminSession(() => bind());
  }, []);
  return null;
}
