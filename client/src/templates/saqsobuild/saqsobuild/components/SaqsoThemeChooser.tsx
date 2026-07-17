"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "saqso-theme-mode";
const REMEMBER_KEY = "saqso-theme-remember";
const SESSION_KEY = "saqso-session-theme";

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.dataset.theme = mode;
}

export default function SaqsoThemeChooser() {
  const [open, setOpen] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_KEY) === "true";
    const saved = remembered ? localStorage.getItem(STORAGE_KEY) : sessionStorage.getItem(SESSION_KEY);

    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
      setOpen(false);
      return;
    }

    setOpen(true);
  }, []);

  const chooseTheme = (mode: ThemeMode) => {
    applyTheme(mode);

    if (remember) {
      localStorage.setItem(REMEMBER_KEY, "true");
      localStorage.setItem(STORAGE_KEY, mode);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(SESSION_KEY, mode);
    }

    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/55 px-4 backdrop-blur-xl">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/15 bg-white p-6 text-slate-950 shadow-[0_35px_120px_rgba(0,0,0,.35)] dark:bg-slate-950 dark:text-white sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.35em] text-amber-600 dark:text-amber-300">
          SAQSO Theme
        </p>

        <h2 className="mt-4 text-3xl font-black tracking-[-.07em] sm:text-4xl">
          Continue with your preferred mode.
        </h2>

        <p className="mt-3 text-sm font-semibold leading-7 text-slate-500 dark:text-white/55">
          Choose Dark or Light mode for this shopping experience.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => chooseTheme("light")}
            className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-left shadow-xl transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.05]"
          >
            <Sun className="mb-5" size={26} />
            <span className="block text-xl font-black">Light Mode</span>
            <span className="mt-2 block text-xs font-bold text-slate-500 dark:text-white/50">
              Clean bright premium UI
            </span>
          </button>

          <button
            onClick={() => chooseTheme("dark")}
            className="group rounded-[1.5rem] border border-slate-900 bg-slate-950 p-5 text-left text-white shadow-xl transition hover:-translate-y-1 dark:border-white/15"
          >
            <Moon className="mb-5" size={26} />
            <span className="block text-xl font-black">Dark Mode</span>
            <span className="mt-2 block text-xs font-bold text-white/55">
              Cinematic luxury UI
            </span>
          </button>
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm font-black text-slate-700 dark:text-white/70">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-5 w-5 rounded border-slate-300"
          />
          Remember my choice
        </label>
      </div>
    </div>
  );
}