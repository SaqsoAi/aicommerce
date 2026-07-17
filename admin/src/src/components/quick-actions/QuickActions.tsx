"use client";

import Link from "next/link";

const actions = [
  {
    title: "Create Product",
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
      border
      border-zinc-200
      dark:border-zinc-800
      rounded-3xl
      p-6
      bg-white
      dark:bg-zinc-900
    "
    >
      <h3
        className="
        text-xl
        font-bold
        mb-5
      "
      >
        Quick Actions
      </h3>

      <div className="grid gap-3">
        {actions.map(
          (action) => (
            <Link
              key={
                action.title
              }
              href={
                action.href
              }
              className="
              p-4
              rounded-xl
              border
              border-zinc-200
              dark:border-zinc-800
              hover:bg-zinc-100
              dark:hover:bg-zinc-800
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
