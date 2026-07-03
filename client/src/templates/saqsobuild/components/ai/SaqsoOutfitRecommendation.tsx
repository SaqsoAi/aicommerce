"use client";

const looks = [
  {
    title: "Premium Polo Look",
    items: ["Polo Shirt", "Denim Pant", "Leather Belt", "Casual Watch"],
  },
  {
    title: "Office Smart Look",
    items: ["Formal Shirt", "Chino Pant", "Brown Shoe", "Minimal Watch"],
  },
  {
    title: "Weekend Street Look",
    items: ["Graphic Tee", "Relax Fit Denim", "Sneakers", "Cap"],
  },
];

export default function SaqsoOutfitRecommendation() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
            AI Outfit Recommendation
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-5xl">
            Complete the look
          </h2>
        </div>

        <a href="/shop" className="text-sm font-black underline">
          Shop matching styles
        </a>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {looks.map((look) => (
          <div
            key={look.title}
            className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="mb-5 flex h-52 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-zinc-100 to-zinc-300 text-6xl dark:from-zinc-900 dark:to-zinc-800">
              👕
            </div>

            <h3 className="text-xl font-black">{look.title}</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {look.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-bold dark:bg-zinc-900"
                >
                  {item}
                </span>
              ))}
            </div>

            <button className="mt-6 w-full rounded-full bg-black py-3 text-sm font-black text-white dark:bg-white dark:text-black">
              View AI Look
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
