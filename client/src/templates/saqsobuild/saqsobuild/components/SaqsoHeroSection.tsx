export default function SaqsoHeroSection({ data }: { data?: any }) {
  return (
    <section className="relative min-h-[860px] overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <img
        src={
          data?.image ||
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=900&fit=crop"
        }
        alt={data?.headline || "Saqso Fashion Hero"}
        className="absolute inset-0 h-full w-full object-cover opacity-70 dark:opacity-55"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-black dark:via-black/75 dark:to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.20),transparent_35%)]" />

      <div className="relative z-10 mx-auto flex min-h-[860px] max-w-7xl items-center px-6 pt-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-amber-400/50 bg-white/50 px-5 py-2 text-sm font-semibold text-amber-700 backdrop-blur-xl dark:bg-white/10 dark:text-amber-300">
            SAQSO PREMIUM FASHION
          </div>

          <h1 className="text-6xl font-black leading-[0.95] tracking-tight md:text-5xl sm:text-7xl xl:text-8xl">
            {data?.headline || "Discover Your Style Story"}
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-700 dark:text-zinc-200 md:text-xl">
            {data?.subheadline ||
              "Curate your perfect wardrobe with pieces that speak to your unique aesthetic."}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/shop"
              className="rounded-full bg-zinc-950 px-8 py-4 font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
            >
              {data?.primaryCta || "Shop New Arrivals"}
            </a>

            <a
              href="/shop"
              className="rounded-full border border-zinc-400 bg-white/50 px-8 py-4 font-bold text-zinc-950 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white dark:border-white/40 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-zinc-950"
            >
              {data?.secondaryCta || "Explore Collection"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


