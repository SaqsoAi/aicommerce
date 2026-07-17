"use client";

import { useRouter } from "next/navigation";

type Props = {
  productId?: string;
  variant?: "full" | "ar" | "compact";
  label?: string;
};

export default function TryOnButton({
  productId,
  variant = "full",
  label,
}: Props) {
  const router = useRouter();

  const target = productId
    ? `/virtual-tryon?productId=${productId}`
    : "/virtual-tryon";

  const goToTryOn = () => {
    router.push(target);
  };

  if (variant === "compact") {
    return (
      <button
        onClick={goToTryOn}
        className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-950 shadow-sm transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-white dark:hover:text-black"
      >
        {label || "Try-On"}
      </button>
    );
  }

  if (variant === "ar") {
    return (
      <button
        onClick={goToTryOn}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        <span>✨</span>
        <span>{label || "Try with AR"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={goToTryOn}
      className="group w-full overflow-hidden rounded-2xl bg-zinc-950 px-5 py-4 text-white shadow-xl transition hover:scale-[1.01] hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      <span className="flex items-center justify-center gap-3 font-black">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg dark:bg-black/10">
          ✨
        </span>
        {label || "Virtual Try-On"}
      </span>

      <span className="mt-1 block text-xs font-medium opacity-70">
        AI preview before checkout
      </span>
    </button>
  );
}

