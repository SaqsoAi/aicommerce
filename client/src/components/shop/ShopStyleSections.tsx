import Link from "next/link";

export default function ShopStyleSections() {
  const stylistPicks = [
    "Premium Panjabi",
    "Luxury Casual",
    "Office Essential",
  ];

  const styleIdeas = [
    "Complete The Look",
    "Festive Ready",
    "Smart Casual",
  ];

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-2">
      <section className="rounded-[32px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              Stylist Picks
            </p>

            <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
              Curated By SAQSO
            </h2>
          </div>

          <Link
            href="/lookbook"
            className="rounded-full border px-4 py-2 text-xs font-bold dark:border-zinc-700"
          >
            View All
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {stylistPicks.map((item) => (
            <Link
              key={item}
              href="/shop"
              className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <span className="font-bold">{item}</span>
              <span className="text-sm text-zinc-500">Shop →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] bg-zinc-950 p-6 text-white dark:bg-white dark:text-black">
        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-70">
          Style It
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Build Your Complete Look
        </h2>

        <div className="mt-6 grid gap-3">
          {styleIdeas.map((item) => (
            <Link
              key={item}
              href="/shop"
              className="rounded-2xl border border-white/20 p-4 font-bold transition hover:bg-white hover:text-black dark:border-black/20 dark:hover:bg-black dark:hover:text-white"
            >
              {item}
            </Link>
          ))}
        </div>

        <Link
          href="/virtual-tryon"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-black dark:bg-black dark:text-white"
        >
          Try Your Look
        </Link>
      </section>
    </div>
  );
}
