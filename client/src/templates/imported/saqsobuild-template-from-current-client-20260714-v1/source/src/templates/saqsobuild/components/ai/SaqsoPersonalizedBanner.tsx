"use client";

export default function SaqsoPersonalizedBanner() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black text-white shadow-2xl dark:border-white/10">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
              AI Personalized Store
            </p>

            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
              Smart fashion recommendations made for your style.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
              Saqso AI learns from your browsing, wishlist, orders and interests to show products that match your taste.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/shop"
                className="rounded-full bg-white px-6 py-3 text-sm font-black text-black"
              >
                Explore AI Picks
              </a>

              <a
                href="/size-fit-center"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white"
              >
                Find My Size
              </a>
            </div>
          </div>

          <div className="grid gap-3 text-sm">
            {[
              "AI Smart Search",
              "Personalized Homepage",
              "Outfit Recommendation",
              "Size Predictor",
              "Recently Viewed",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 font-bold backdrop-blur"
              >
                ✦ {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

