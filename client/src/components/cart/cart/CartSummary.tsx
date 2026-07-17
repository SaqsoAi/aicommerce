"use client";

export default function CartSummary({ items }: any) {
  const subtotal = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const shipping = 100;
  const total = subtotal + shipping;

  return (
    <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-2xl font-black text-zinc-950 dark:text-white">
        Order Summary
      </h2>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Subtotal</span>
          <b>Tk {subtotal.toLocaleString()}</b>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">Delivery</span>
          <b>Tk {shipping.toLocaleString()}</b>
        </div>

        <hr className="dark:border-zinc-800" />

        <div className="flex justify-between text-lg">
          <span className="font-black">Total</span>
          <b>Tk {total.toLocaleString()}</b>
        </div>
      </div>
    </div>
  );
}

