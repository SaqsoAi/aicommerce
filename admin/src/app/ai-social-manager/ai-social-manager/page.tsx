"use client";

import { useMemo, useState } from "react";

type Channel = "facebook" | "instagram" | "whatsapp" | "messenger" | "tiktok" | "telegram" | "linkedin" | "x" | "youtube";

const channels: Channel[] = ["facebook", "instagram", "whatsapp", "messenger", "tiktok", "telegram", "linkedin", "x", "youtube"];

export default function AiSocialManagerPage() {
  const [channel, setChannel] = useState<Channel>("facebook");
  const [message, setMessage] = useState("Price and delivery charge?");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const payload = useMemo(() => ({
    channel,
    source: "COMMENT",
    message,
    language: "en",
    knowledge: {
      products: [],
      inventory: [],
      faq: [],
      deliveryPolicy: "Use approved delivery policy before confirming.",
      returnPolicy: "Use approved return policy before confirming.",
    },
  }), [channel, message]);

  async function generateDraft() {
    setLoading(true);
    setResult(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const endpoint = `${base.replace(/\/$/, "")}/ai/social/comments/suggest`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      setResult(json?.data || json);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed to generate draft" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Enterprise AI</p>
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white">AI Social Media Manager</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                Draft-only social hub for Facebook, Instagram, WhatsApp, Messenger, TikTok, Telegram, LinkedIn, X and YouTube.
                Replies, DMs, moderation, leads, handoff, analytics and scheduler require human approval.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              No auto reply Â· No auto DM Â· No auto publish
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {channels.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setChannel(item)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                channel === item
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              }`}
            >
              <div className="text-lg font-bold capitalize">{item === "x" ? "X (Twitter)" : item}</div>
              <div className="mt-1 text-xs opacity-75">Managed via provider registry boundary</div>
            </button>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Comment / DM Draft</h2>
            <p className="mt-1 text-sm text-slate-500">AI suggests a staff-review reply only.</p>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-4 min-h-40 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-950 outline-none focus:border-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={generateDraft}
              disabled={loading}
              className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              {loading ? "Generating..." : "Generate Suggested Reply"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">AI Review Output</h2>
            <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-100 p-4 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {result ? JSON.stringify(result, null, 2) : "No draft generated yet."}
            </pre>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {["Comment Manager", "DM Manager", "Lead Manager", "Sentiment + Spam", "Human Handoff", "Analytics", "Scheduler", "Approval Workflow"].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
              {item}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}