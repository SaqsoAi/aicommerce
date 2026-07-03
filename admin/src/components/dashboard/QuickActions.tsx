"use client";

import Link from "next/link";

const actions = [
  {
    title: "Add Product",
    href: "/products",
  },
  {
    title: "Create Brand",
    href: "/brands",
  },
  {
    title: "Inventory",
    href: "/inventory",
  },
  {
    title: "Orders",
    href: "/orders",
  },
];

export default function QuickActions() {
  return (
    <div
      className="
      bg-white
      dark:bg-zinc-900

      border
      border-zinc-200
      dark:border-zinc-800

      rounded-3xl

      p-6
    "
    >
      <h2
        className="
        text-xl
        font-bold
        mb-4
      "
      >
        Quick Actions
      </h2>

      <div className="grid gap-3">
        {actions.map(
          (action) => (
            <Link
              key={action.title}
              href={action.href}
              className="
              p-3
              rounded-xl

              bg-zinc-100
              dark:bg-zinc-800

              hover:scale-[1.02]

              transition
              "
            >
              {action.title}
            </Link>
          )
        )}
      </div>
    </div>
  );
}