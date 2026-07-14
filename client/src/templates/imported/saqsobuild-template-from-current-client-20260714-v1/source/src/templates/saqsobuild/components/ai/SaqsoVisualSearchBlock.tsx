"use client";

export default function SaqsoVisualSearchBlock() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
          AI Visual Search
        </p>

        <h2 className="mt-3 text-3xl font-black md:text-5xl">
          Upload a photo, find similar products
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-zinc-500">
          Google Lens style product discovery. This frontend block is ready; backend AI vision will connect in Phase 8.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <input type="file" accept="image/*" className="w-full text-sm" />

          <button className="mt-4 w-full rounded-2xl bg-black py-3 text-sm font-black text-white dark:bg-white dark:text-black">
            Find Similar Products
          </button>
        </div>
      </div>
    </section>
  );
}
