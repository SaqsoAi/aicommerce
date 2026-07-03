"use client";

import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
}: Props) {
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

      shadow-sm

      hover:shadow-xl
      transition-all
    "
    >
      <div className="flex justify-between">
        <div>
          <p className="text-zinc-500">
            {title}
          </p>

          <h2
            className="
            text-4xl
            font-bold
            mt-3
          "
          >
            {value}
          </h2>
        </div>

        <div
          className="
          w-14
          h-14

          rounded-2xl

          bg-zinc-100
          dark:bg-zinc-800

          flex
          items-center
          justify-center
        "
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}