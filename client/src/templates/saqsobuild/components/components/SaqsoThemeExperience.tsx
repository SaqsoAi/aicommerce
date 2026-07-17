"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Laptop, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const MODE_KEY = "saqso-theme-mode";
const REMEMBER_KEY = "saqso-theme-remember";
const SESSION_MODE_KEY = "saqso-session-theme-mode";

function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function applyTheme(mode: ThemeMode) {
  const resolved = resolveMode(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = mode;
}

export function getStoredThemeMode(): ThemeMode | null {
  if (typeof window === "undefined") return null;

  const remember = localStorage.getItem(REMEMBER_KEY) === "true";
  const value = remember ? localStorage.getItem(MODE_KEY) : sessionStorage.getItem(SESSION_MODE_KEY);

  if (value === "light" || value === "dark" || value === "system") return value;
  return null;
}

export function setSaqsoThemeMode(mode: ThemeMode, remember = true) {
  applyTheme(mode);

  if (remember) {
    localStorage.setItem(REMEMBER_KEY, "true");
    localStorage.setItem(MODE_KEY, mode);
    sessionStorage.removeItem(SESSION_MODE_KEY);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(MODE_KEY);
    sessionStorage.setItem(SESSION_MODE_KEY, mode);
  }

  window.dispatchEvent(new CustomEvent("saqso-theme-change", { detail: { mode } }));
}

export default function SaqsoThemeExperience() {
  const [open, setOpen] = useState(false);
  const [remember, setRemember] = useState(true);
  const [selected, setSelected] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

  const options = useMemo(
    () => [
      { mode: "light" as const, title: "Light", text: "Clean premium bright shopping UI.", icon: Sun },
      { mode: "dark" as const, title: "Dark", text: "Cinematic luxury dark experience.", icon: Moon },
      { mode: "system" as const, title: "System", text: "Follow browser or device preference.", icon: Laptop },
    ],
    []
  );

  useEffect(() => {
    const stored = getStoredThemeMode();

    if (stored) {
      applyTheme(stored);
      setSelected(stored);
      setOpen(false);
    } else {
      applyTheme("system");
      setSelected("system");
      setOpen(true);
    }

    setReady(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      const mode = getStoredThemeMode();
      if (mode === "system" || !mode) applyTheme("system");
    };

    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const continueTheme = () => {
    setSaqsoThemeMode(selected, remember);
    setOpen(false);
  };

  if (!ready || !open) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 px-4 backdrop-blur-2xl">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2.25rem] border border-white/15 bg-white text-slate-950 shadow-[0_40px_160px_rgba(0,0,0,.35)] dark:bg-slate-950 dark:text-white">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-white/10 dark:bg-white/[0.04] sm:px-8">
          <p className="text-xs font-black uppercase tracking-[.35em] text-amber-600 dark:text-amber-300">
            Welcome to SAQSO
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-.07em] sm:text-5xl">
            Choose your experience.
          </h2>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-500 dark:text-white/55">
            Continue with Light, Dark, or System mode. You can change it anytime from the header.
          </p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-8">
          {options.map((item) => {
            const Icon = item.icon;
            const active = selected === item.mode;

            return (
              <button
                key={item.mode}
                onClick={() => setSelected(item.mode)}
                className={[
                  "relative rounded-[1.6rem] border p-5 text-left shadow-xl transition hover:-translate-y-1",
                  active
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.05]",
                ].join(" ")}
              >
                <Icon size={26} />
                <span className="mt-6 block text-xl font-black">{item.title}</span>
                <span className={["mt-2 block text-xs font-bold leading-5", active ? "opacity-70" : "text-slate-500 dark:text-white/50"].join(" ")}>
                  {item.text}
                </span>
                {active ? (
                  <span className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-black">
                    <Check size={16} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-black text-slate-700 dark:text-white/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300"
            />
            Remember my choice
          </label>

          <button
            onClick={continueTheme}
            className="rounded-full bg-slate-950 px-8 py-4 text-xs font-black uppercase tracking-[.2em] text-white shadow-2xl transition hover:-translate-y-1 dark:bg-white dark:text-black"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}