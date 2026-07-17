import Link from "next/link";

export default function ShopProfessionalSections() {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3">
      <section className="rounded-[32px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
          Stylist Picks
        </p>

        <h2 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white">
          Curated For You
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Discover ready-to-wear looks selected for seasonal campaigns,
          occasion wear and daily styling.
        </p>

        <Link
          href="/lookbook"
          className="mt-6 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-black"
        >
          Open Lookbook
        </Link>
      </section>

      <section className="rounded-[32px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
          Size Confidence
        </p>

        <h2 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white">
          Find The Right Fit
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Use the size guide and virtual fitting room before adding products
          to cart.
        </p>

        <Link
          href="/size-guide"
          className="mt-6 inline-flex rounded-full border border-zinc-950 px-5 py-3 text-sm font-black text-zinc-950 dark:border-white dark:text-white"
        >
          Size Guide
        </Link>
      </section>

      <section className="rounded-[32px] bg-zinc-950 p-6 text-white dark:bg-white dark:text-black">
        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-70">
          Try Before Checkout
        </p>

        <h2 className="mt-3 text-2xl font-black">
          Virtual Try-On Ready
        </h2>

        <p className="mt-3 text-sm leading-6 opacity-70">
          Preview selected products with camera-supported virtual try-on.
        </p>

        <Link
          href="/virtual-tryon"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-black dark:bg-black dark:text-white"
        >
          Start Try-On
        </Link>
      </section>
    </div>
  );
}

