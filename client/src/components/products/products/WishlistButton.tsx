"use client";

import {
  addToWishlist,
} from "@/services/wishlist.service";

import {
  useAuth,
} from "@/providers/AuthProvider";

export default function WishlistButton({
  productId,
}: {
  productId: string;
}) {
  const { user } =
    useAuth();

  const handleAdd =
    async () => {
      if (!user?.id)
        return;

      await addToWishlist(
        user.id,
        productId
      );

      alert(
        "Added to wishlist"
      );
    };

  return (
    <button
      onClick={handleAdd}
      className="
      border
      px-4
      py-2
      rounded-xl
    "
    >
      â™¡ Wishlist
    </button>
  );
}


