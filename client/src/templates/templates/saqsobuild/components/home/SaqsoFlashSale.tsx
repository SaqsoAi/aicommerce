import Link from "next/link";

const deals = [
  {
    title: "Premium Shirt",
    price: "Tk 1,490",
    oldPrice: "Tk 2,200",
  },
  {
    title: "Luxury Bag",
    price: "Tk 2,990",
    oldPrice: "Tk 4,500",
  },
  {
    title: "Sneaker Drop",
    price: "Tk 3,490",
    oldPrice: "Tk 5,000",
  },
];

export default function SaqsoFlashSale() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-red-600 p-8 text-white md:p-12">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-white/20 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-red-100">
              Flash Sale
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-6xl">
              Limited Time Premium Deals
            </h2>

            <p className="mt-4 max-w-xl text-red-100">
              Exclusive campaign offers with membership rewards and fast checkout experience.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 text-center">
              {["12H", "44M", "22S", "LIVE"].map((time) => (
                <div key={time} className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-xl font-black">{time}</p>
                </div>
              ))}
            </div>

            <Link
              href="/shop?flash=sale"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-4 font-bold text-red-600"
            >
              Shop Flash Sale
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {deals.map((deal) => (
              <div key={deal.title} className="rounded-3xl bg-white p-5 text-zinc-950">
                <div className="mb-5 h-40 rounded-2xl bg-zinc-100" />
                <h3 className="font-black">{deal.title}</h3>
                <p className="mt-2 text-xl font-black">{deal.price}</p>
                <p className="text-sm text-zinc-400 line-through">{deal.oldPrice}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


