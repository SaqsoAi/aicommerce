import { AI_MARKETING_APPROVAL_POLICY, AI_MARKETING_CHANNELS, AI_MARKETING_GOVERNANCE } from "@/lib/aiMarketingAutomation";

export default function AiMarketingPage() {
  return (
    <main className="p-6 space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold text-muted-foreground">Phase 6.9</p>
        <h1 className="mt-2 text-2xl font-bold">Enterprise AI Marketing Automation</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          AI-generated marketing drafts for email, SMS, WhatsApp, push, coupon, journey, and calendar workflows. All actions follow Human Approval First policy. No auto-send, no auto-publish, and no automatic coupon activation.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AI_MARKETING_CHANNELS.map((item) => (
          <article key={item.value} className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">{item.label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Draft generation only. Admin approval required before customer-facing delivery.</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Human Approval First Policy</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {AI_MARKETING_APPROVAL_POLICY.map((rule) => <li key={rule}>â€¢ {rule}</li>)}
        </ul>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Governance</h2>
        <pre className="mt-3 overflow-auto rounded-lg bg-muted p-4 text-xs">{JSON.stringify(AI_MARKETING_GOVERNANCE, null, 2)}</pre>
      </section>
    </main>
  );
}