import Link from "next/link";

export default function ShopProfessionalHero() {
  return (
    <section className="mb-8 overflow-hidden rounded-[36px] bg-zinc-950 text-white dark:bg-white dark:text-black">
      <div className="grid gap-8 p-8 md:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] opacity-70">
            SAQSO COLLECTION
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Shop Smart. Try Virtually. Style Confidently.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 opacity-70 md:text-base">
            Explore curated fashion with AI recommendations, wishlist, quick view,
            size guide and virtual try-on support.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/virtual-tryon"
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-black dark:bg-black dark:text-white"
            >
              Virtual Try-On
            </Link>

            <Link
              href="/size-guide"
              className="rounded-full border border-white px-6 py-3 text-sm font-black dark:border-black"
            >
              Size Guide
            </Link>

            <Link
              href="/lookbook"
              className="rounded-full border border-white px-6 py-3 text-sm font-black dark:border-black"
            >
              View Lookbook
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] bg-white/10 p-6 backdrop-blur dark:bg-black/10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] opacity-70">
            Shopping Tools
          </p>

          <div className="mt-5 grid gap-3">
            {[
              "AI Recommended Products",
              "Quick View Before Checkout",
              "Wishlist & Saved Looks",
              "Membership + Rewards Benefits",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/15 p-4 text-sm font-semibold dark:border-black/15"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

