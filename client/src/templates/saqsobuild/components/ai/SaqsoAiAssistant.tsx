"use client";

import { useState } from "react";

export default function SaqsoAiAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-5 z-[90] w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="bg-black p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
                  AI Assistant
                </p>
                <h3 className="mt-1 text-lg font-black">Saqso Stylist</h3>
              </div>

              <button onClick={() => setOpen(false)} className="text-xl">
                ×
              </button>
            </div>
          </div>

          <div className="space-y-3 p-5 text-sm">
            <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
              Ask me: “black polo under 2000” or “best size for me”.
            </div>

            <input
              placeholder="Ask about products, size, outfit..."
              className="w-full rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 outline-none dark:border-zinc-800"
            />

            <button className="w-full rounded-2xl bg-black py-3 font-black text-white dark:bg-white dark:text-black">
              Ask AI
            </button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[90] rounded-full bg-black px-6 py-4 text-sm font-black text-white shadow-2xl dark:bg-white dark:text-black"
      >
        ✦ AI Stylist
      </button>
    </>
  );
}
