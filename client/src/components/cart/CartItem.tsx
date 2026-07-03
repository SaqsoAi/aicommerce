"use client";

import { useCartStore } from "@/store/cart.store";
import { normalizeImageUrl } from "@/lib/normalizeImageUrl";
import { getProductImage } from "@/lib/product-image";

export default function CartItem({ item }: any) {
  const { removeFromCart, updateQuantity } = useCartStore();

  const qty = Number(item.quantity || 1);
  const price = Number(item.price || 0);

  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row">
      <img
        src={getProductImage(item) || "/placeholder-product.svg"}
        alt={item.name || "Cart item"}
        className="h-32 w-full rounded-2xl bg-zinc-100 object-contain p-2 dark:bg-zinc-900 sm:w-32"
      />

      <div className="flex flex-1 flex-col justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-zinc-950 dark:text-white">
            {item.name || "Product"}
          </h3>

          <p className="mt-1 text-sm font-bold text-zinc-500">
            Tk {price.toLocaleString()}
          </p>

          {item.variantLabel ? (
            <p className="mt-1 text-xs text-zinc-500">{item.variantLabel}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, Math.max(1, qty - 1))}
              className="px-4 py-2 font-black"
            >
              -
            </button>

            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) =>
                updateQuantity(item.id, Math.max(1, Number(e.target.value)))
              }
              className="w-16 bg-transparent px-2 py-2 text-center outline-none"
            />

            <button
              type="button"
              onClick={() => updateQuantity(item.id, qty + 1)}
              className="px-4 py-2 font-black"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm text-zinc-500">Subtotal</p>
            <p className="font-black">Tk {(price * qty).toLocaleString()}</p>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(item.id)}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

