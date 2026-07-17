"use client";

import { useState } from "react";
import { requestAiCustomerExperience } from "@/lib/ai/customerExperience";

type Props = {
  placement: "homepage" | "product" | "cart" | "checkout" | "dashboard" | "membership" | "wishlist";
  products?: unknown[];
  context?: Record<string, unknown>;
};

export default function AiCustomerExperiencePanel({ placement, products = [], context = {} }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await requestAiCustomerExperience({
        endpoint: "shopping-assistant",
        payload: { message, products, context: { ...context, placement } },
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/5 p-4 dark:bg-white/5">
      <div className="mb-3">
        <h3 className="text-base font-semibold">AI Shopping Help</h3>
        <p className="text-sm opacity-70">Gateway-powered customer assistance. Provider details stay hidden.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask for size, outfit, gift, coupon, cart, or checkout help"
          className="min-h-11 flex-1 rounded-xl border px-3 text-sm dark:bg-black"
        />
        <button type="button" onClick={submit} disabled={loading} className="rounded-xl px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-50">
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      {result ? <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-black/5 p-3 text-xs dark:bg-white/10">{JSON.stringify(result, null, 2)}</pre> : null}
    </section>
  );
}