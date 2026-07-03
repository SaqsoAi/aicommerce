import Link from "next/link";

const actions = [
  { title: "My Orders", href: "/orders" },
  { title: "Wishlist", href: "/wishlist" },
  { title: "Returns", href: "/dashboard/returns" },
  { title: "Refunds", href: "/dashboard/refunds" },
  { title: "Notifications", href: "/dashboard/notifications" },
  { title: "Shop Now", href: "/shop" },
  { title: "Account Settings", href: "#account-settings" },
];

export default function QuickActions() {
  return (
    <div className="grid gap-5 md:grid-cols-4">
      {actions.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="text-lg font-black text-zinc-950 dark:text-white">
            {item.title}
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Open
          </p>
        </Link>
      ))}
    </div>
  );
}





