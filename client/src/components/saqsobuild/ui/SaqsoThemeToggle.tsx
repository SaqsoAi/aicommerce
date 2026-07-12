"use client";

import { useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("saqso-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function SaqsoThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const next = getInitialTheme();
    setMode(next);
    document.documentElement.dataset.theme = next;
  }, []);

  const label = useMemo(() => mode === "dark" ? "Switch to light mode" : "Switch to dark mode", [mode]);

  function toggleTheme() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("saqso-theme", next);
  }

  return (
    <button type="button" className={["saqso-theme-toggle", className].filter(Boolean).join(" ")} onClick={toggleTheme} aria-label={label} title={label}>
      <span className="saqso-theme-toggle__track"><span className="saqso-theme-toggle__thumb" /></span>
      <span className="saqso-theme-toggle__text">{mode === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}