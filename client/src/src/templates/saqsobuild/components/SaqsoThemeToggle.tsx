"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

type ThemeMode = "light" | "dark" | "system";

const order: ThemeMode[] = ["light", "dark", "system"];

export default function SaqsoThemeToggle() {
  const { theme: mode, setTheme } = useTheme();

  const nextMode = () => {
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setTheme(next);
  };

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Laptop;

  return (
    <button
      type="button"
      onClick={nextMode}
      aria-label={`Current theme ${mode}. Click to change theme.`}
      className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/85 text-slate-900 shadow-lg transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
    >
      <Icon size={18} />
    </button>
  );
}


