import Link from "next/link";

const cards = [
  {
    title: "Customer Profiles",
    description: "Review customer identity, membership status, account health, and profile completeness.",
    href: "/account-management/customers",
  },
  {
    title: "Membership Rules",
    description: "Manage tiers, eligibility, benefits, and member-facing account widgets.",
    href: "/account-management/membership",
  },
  {
    title: "Reward Controls",
    description: "Prepare reward balance, ledger, adjustments, and campaign hooks for admin review.",
    href: "/account-management/rewards",
  },
  {
    title: "Wishlist Intelligence",
    description: "Inspect saved products, product demand signals, and personalized recommendations.",
    href: "/account-management/wishlist",
  },
  {
    title: "Address Book",
    description: "Support customer delivery profile, default address, and account support workflows.",
    href: "/account-management/addresses",
  },
  {
    title: "Account Timeline",
    description: "Central timeline for orders, rewards, wishlist, support, and profile changes.",
    href: "/account-management/timeline",
  },
];

export default function AccountManagementPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-300">
            Customer Management
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Account Admin Management</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Phase 8.11 prepares admin-side ownership for customer profile, membership,
                rewards, wishlist, address, and account timeline management. This page avoids
                Phase 7 dashboard files and keeps the account management surface isolated.
              </p>
            </div>
            <Link
              href="/customers"
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
            >
              Open Customers
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/[0.07]"
            >
              <h2 className="text-xl font-black">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
              <span className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-amber-200">
                Forms & CRUD
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-6">
          <h2 className="text-lg font-black text-emerald-200">Implementation Status</h2>
          <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
            <li>Admin route added without Phase 7 dashboard modification.</li>
            <li>Account management widgets prepared for Phase 8.12 client integration.</li>
            <li>No database migration executed in this phase.</li>
            <li>No production sync or git push.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}