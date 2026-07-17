export default function LookbookHero() {
  return (
    <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-black px-4 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#444,transparent_45%)] opacity-70" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.45em] text-white/60">SAQSO Lookbook</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
          Curated looks for modern luxury lifestyle.
        </h1>
        <p className="mt-6 max-w-2xl text-white/70">
          Discover premium outfit stories, shop complete looks, and try selected styles virtually.
        </p>
      </div>
    </section>
  );
}
