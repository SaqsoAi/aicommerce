"use client";

import { useEffect, useState } from "react";

type DraftState = {
  title: string;
  note: string;
  savedAt: string;
};

const initialDraft: DraftState = {
  title: "Premium Fashion Hero",
  note: "Enterprise draft recovery foundation.",
  savedAt: "",
};

export default function HeroAutosaveHistoryPanel() {
  const storageKey = "ai-commerce:homepage-hero:draft-history";
  const [draft, setDraft] = useState<DraftState>(initialDraft);
  const [history, setHistory] = useState<DraftState[]>([initialDraft]);
  const [index, setIndex] = useState(0);
  const [recovered, setRecovered] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as DraftState[];
      if (Array.isArray(saved) && saved.length > 0) {
        setHistory(saved);
        setIndex(saved.length - 1);
        setDraft(saved[saved.length - 1]);
        setRecovered(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = { ...draft, savedAt: new Date().toLocaleTimeString() };
      setHistory((prev) => {
        const updated = [...prev.slice(0, index + 1), next].slice(-25);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setIndex(updated.length - 1);
        return updated;
      });
      setDraft(next);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [draft.title, draft.note, index]);

  const saveNow = () => {
    const next = { ...draft, savedAt: new Date().toLocaleTimeString() };
    const updated = [...history.slice(0, index + 1), next].slice(-25);
    setHistory(updated);
    setIndex(updated.length - 1);
    setDraft(next);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const undo = () => {
    const nextIndex = Math.max(0, index - 1);
    setIndex(nextIndex);
    setDraft(history[nextIndex]);
  };

  const redo = () => {
    const nextIndex = Math.min(history.length - 1, index + 1);
    setIndex(nextIndex);
    setDraft(history[nextIndex]);
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 text-white shadow-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">SPRINT-1.7D.5 PART-B</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Auto Save + Undo / Redo</h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Background auto-save, undo stack, redo stack and draft recovery foundation.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm font-black text-emerald-100">
          {recovered ? "Recovered" : "Live Draft"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
          <label className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Draft Title
            <input
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none"
            />
          </label>

          <label className="mt-5 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Draft Note
            <textarea
              value={draft.note}
              onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
              className="mt-3 h-28 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none"
            />
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button onClick={undo} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-black">Undo</button>
            <button onClick={redo} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-black">Redo</button>
            <button onClick={saveNow} className="rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-slate-950">Save Now</button>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-300">Draft Recovery</p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            History: {history.length} checkpoints
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Current index: {index + 1}
          </p>
          <p className="mt-3 rounded-2xl bg-white/5 p-4 text-sm font-bold">
            Last saved: {draft.savedAt || "Waiting for first save"}
          </p>
        </aside>
      </div>
    </section>
  );
}