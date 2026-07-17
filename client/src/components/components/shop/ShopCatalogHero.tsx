import Link from "next/link";

export default function ShopCatalogHero() {
  return (
    <section className="mb-8 rounded-[36px] bg-zinc-950 p-8 text-white dark:bg-white dark:text-black md:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.35em] opacity-70">
        SAQSO PRODUCT CATALOG
      </p>

      <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <h1 className="max-w-3xl text-4xl font-black md:text-6xl">
            Discover Fashion Curated For You
          </h1>

          <p className="mt-4 max-w-2xl text-sm opacity-70 md:text-base">
            Search, filter, quick view, wishlist, virtual try-on and AI-powered style discovery in one premium catalog.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/virtual-tryon"
            className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black dark:bg-black dark:text-white"
          >
            Virtual Try-On
          </Link>

          <Link
            href="/size-guide"
            className="rounded-full border border-white px-5 py-3 text-sm font-bold dark:border-black"
          >
            Size Guide
          </Link>

          <Link
            href="/lookbook"
            className="rounded-full border border-white px-5 py-3 text-sm font-bold dark:border-black"
          >
            Lookbook
          </Link>
        </div>
      </div>
    </section>
  );
}

