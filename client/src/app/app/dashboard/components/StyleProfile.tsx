import { SaqsoCard } from "@/components/saqso";

export default function StyleProfile() {
  return (
    <SaqsoCard>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Style Profile
      </p>
      <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
        Modern Premium
      </h2>
      <p className="mt-3 text-sm text-zinc-500">
        AI style profile will learn from your orders, wishlist and browsing.
      </p>
    </SaqsoCard>
  );
}



