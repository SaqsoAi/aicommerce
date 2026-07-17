"use client";

export default function AutomationHistoryPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Automation Timeline
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Your Communication & Workflow History
        </h1>

        <p className="mt-3 text-neutral-300">
          This page shows workflow-triggered notifications, order automations,
          provider events, and communication history connected with your account.
        </p>

        <div className="mt-8 grid gap-4">
          {[
            "Order automation triggered",
            "Notification workflow executed",
            "Provider delivery event received",
            "Business event timeline updated",
          ].map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/30 p-5"
            >
              <div className="text-sm text-neutral-400">
                Step {index + 1}
              </div>
              <div className="mt-1 font-semibold">
                {item}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
