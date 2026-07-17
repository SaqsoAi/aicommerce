import { creativeGovernance, creativeStudioKinds } from "../../lib/aiCreativeStudio";

export default function AiCreativeStudioPage() {
  return (
    <main className="p-6 space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phase 6.8</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Enterprise AI Creative Studio</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Creative Studio foundation for product images, lifestyle scenes, models, banners, posters, stories, thumbnails and video planning. This page preserves the existing admin design system and does not auto-generate or auto-publish assets.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {creativeStudioKinds.map((item) => (
          <div key={item.value} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-semibold text-slate-900 dark:text-white">{item.label}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Gateway-routed preview workflow with admin approval required.</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Governance Rules</h2>
        <ul className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
          {creativeGovernance.map((rule) => <li key={rule}>- {rule}</li>)}
        </ul>
      </section>
    </main>
  );
}
