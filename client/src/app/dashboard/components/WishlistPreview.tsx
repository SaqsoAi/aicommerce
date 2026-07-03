import { SaqsoCard } from "@/components/saqso";

export default function WishlistPreview() {
  return (
    <SaqsoCard>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Wishlist
      </p>
      <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
        Saved Looks
      </h2>
      <p className="mt-3 text-sm text-zinc-500">
        Wishlist preview will appear here.
      </p>
    </SaqsoCard>
  );
}



