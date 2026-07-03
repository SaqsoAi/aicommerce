"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

const API = "/api";

function applyTheme(theme: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;

  return resolved;
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

async function fetchAdminDefaultTheme(): Promise<ThemeMode> {
  try {
    const res = await fetch(`${API}/enterprise-settings`, { cache: "no-store" });
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const found = list.find((x: any) => {
      const k = normalizeKey(String(x.key || x.name || x.label || x.id || ""));
      return k === "defaulttheme" || k === "theme" || k === "sitetheme";
    });
    const value = String(found?.value || "").toLowerCase();
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {}
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    let alive = true;

    async function boot() {
      const saved = localStorage.getItem("theme") as ThemeMode | null;
      const adminDefault = await fetchAdminDefaultTheme();
      const next = saved || adminDefault || "dark";

      if (!alive) return;

      setThemeState(next);
      setResolvedTheme(applyTheme(next));
    }

    boot();

    const listener = () => {
      setResolvedTheme(applyTheme(theme));
    };

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", listener);

    return () => {
      alive = false;
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", listener);
    };
  }, []);

  const setTheme = (next: ThemeMode) => {
    localStorage.setItem("theme", next);
    localStorage.setItem("saqso-theme", next);
    setThemeState(next);
    setResolvedTheme(applyTheme(next));
  };

  const toggleTheme = () => {
  setTheme(theme === "dark" ? "light" : "dark");
};
const value = useMemo(() => ({
  theme,
  resolvedTheme,
  setTheme,
  toggleTheme,
}), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;

