import Link from "next/link";

const tiers = [
  {
    name: "Silver",
    amount: "Tk 5,000+",
    discount: "10%",
    benefits: "Instant discount, rewards points",
  },
  {
    name: "Gold",
    amount: "Tk 10,000+",
    discount: "15%",
    benefits: "Birthday gift, early access",
  },
  {
    name: "Platinum",
    amount: "Tk 15,000+",
    discount: "20%",
    benefits: "Priority rewards, exclusive campaigns",
  },
  {
    name: "Diamond",
    amount: "Tk 20,000+",
    discount: "25%",
    benefits: "VIP offers, premium support",
  },
];

export default function SaqsoMembershipBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-8 text-white shadow-2xl md:p-12">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">
              SAQSOBUILD MEMBERSHIP
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Shop More. Unlock More.
            </h2>

            <p className="mt-5 max-w-xl text-zinc-300">
              Get physical or virtual membership cards, instant discounts on non-discounted items, reward points, birthday gifts and exclusive member-only campaigns.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-7 py-4 font-bold text-black"
              >
                View My Membership
              </Link>

              <Link
                href="/shop"
                className="rounded-full border border-white/30 px-7 py-4 font-bold text-white"
              >
                Start Shopping
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black">
                    {tier.name}
                  </h3>

                  <span className="rounded-full bg-amber-300 px-4 py-2 text-sm font-black text-black">
                    {tier.discount}
                  </span>
                </div>

                <p className="mt-3 text-sm font-bold text-zinc-200">
                  Single invoice {tier.amount}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  {tier.benefits}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


