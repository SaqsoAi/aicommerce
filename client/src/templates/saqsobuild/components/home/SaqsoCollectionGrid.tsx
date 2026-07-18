import Link from "next/link";

const collections = [
  {
    title: "Luxury Collection",
    desc: "Premium pieces for elevated style.",
    href: "/shop?collection=luxury",
  },
  {
    title: "Modern Essentials",
    desc: "Clean looks for daily wear.",
    href: "/shop?collection=modern",
  },
  {
    title: "Street Style",
    desc: "Bold fashion for modern culture.",
    href: "/shop?collection=street",
  },
  {
    title: "Occasion Wear",
    desc: "Selected styles for special moments.",
    href: "/shop?collection=occasion",
  },
];

export default function SaqsoCollectionGrid({ settings = {} }: { settings?: Record<string, unknown> }) {
  const configured = Array.isArray(settings.items) ? settings.items as typeof collections : collections;
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          {String(settings.eyebrow || "Fresh Drops")}
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 dark:text-white md:text-3xl sm:text-2xl sm:text-3xl lg:text-4xl lg:text-5xl">
          {String(settings.title || "New Arrivals")}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-1 sm:grid-cols-2">
        {configured.map((item, index) => (
          <Link
            key={item.title}
            href={item.href}
            className="group overflow-hidden rounded-[2rem] border bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex min-h-[220px] flex-col justify-between">
              <span className="text-sm font-bold text-zinc-400">
                0{index + 1}
              </span>

              <div>
                <h3 className="text-3xl font-black text-zinc-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-zinc-500">
                  {item.desc}
                </p>
                <span className="mt-6 inline-flex rounded-full bg-zinc-950 px-6 py-3 font-bold text-white dark:bg-white dark:text-black">
                  View Collection
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}



