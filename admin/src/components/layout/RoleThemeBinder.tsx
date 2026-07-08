"use client";

import { useEffect } from "react";

type RoleTheme = "super-admin" | "admin" | "user-admin";

function normalizeRole(value: unknown): RoleTheme {
  const raw = String(value ?? "").toLowerCase().replace(/_/g, "-").trim();

  if (
    raw.includes("super-admin") ||
    raw.includes("super admin") ||
    raw.includes("superadmin") ||
    raw === "owner"
  ) {
    return "super-admin";
  }

  if (
    raw.includes("user-admin") ||
    raw.includes("user admin") ||
    raw.includes("staff") ||
    raw.includes("manager") ||
    raw.includes("editor")
  ) {
    return "user-admin";
  }

  return "admin";
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readRoleFromStorage(): RoleTheme {
  if (typeof window === "undefined") return "admin";

  const directKeys = [
    "role",
    "userRole",
    "adminRole",
    "authRole",
    "ai-commerce-role",
    "admin-role",
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    if (value) return normalizeRole(value);
  }

  const objectKeys = ["user", "admin", "auth", "authUser", "currentUser", "profile"];
  for (const key of objectKeys) {
    const raw = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const role = parsed.role || parsed.userRole || parsed.type || parsed.accessLevel;
      if (role) return normalizeRole(role);
    } catch {
      // Ignore non-JSON storage values safely.
    }
  }

  const tokenKeys = ["token", "accessToken", "adminToken", "authToken"];
  for (const key of tokenKeys) {
    const token = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    if (!token) continue;

    const payload = decodeJwtPayload(token);
    const role = payload?.role || payload?.userRole || payload?.type || payload?.accessLevel;
    if (role) return normalizeRole(role);
  }

  return "admin";
}

export default function RoleThemeBinder() {
  useEffect(() => {
    const apply = () => {
      const roleTheme = readRoleFromStorage();
      document.documentElement.setAttribute("data-role-theme", roleTheme);
      document.body.setAttribute("data-role-theme", roleTheme);
    };

    apply();

    const onStorage = () => apply();
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}