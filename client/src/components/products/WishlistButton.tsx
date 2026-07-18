"use client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { addToWishlist } from "@/services/wishlist.service";

export default function WishlistButton({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  async function handleAdd() {
    if (!user?.id) { window.location.href = "/login"; return; }
    try { setSaving(true); await addToWishlist(user.id, productId); setSaved(true); }
    finally { setSaving(false); }
  }
  return <button type="button" onClick={handleAdd} disabled={saving} aria-pressed={saved} aria-label={saved ? "Saved to wishlist" : "Add to wishlist"} title={saved ? "Saved" : "Wishlist"} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/35 text-white shadow-lg backdrop-blur transition hover:border-rose-400 hover:text-rose-400 disabled:opacity-60"><Heart size={19} aria-hidden="true" className={saved ? "fill-rose-500 text-rose-500" : ""}/></button>;
}
