"use client";

type Props = {
  items: any[];
};

export default function OrderSummary({
  items,
}: Props) {
  const subtotal =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.quantity || 1),
      0
    );

  const shipping = 100;

  const total =
    subtotal + shipping;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-xl font-black">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm sm:text-[15px]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <b>Tk {subtotal}</b>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <b>Tk {shipping}</b>
        </div>

        <hr className="dark:border-zinc-800" />

        <div className="flex justify-between text-lg">
          <span>Total</span>
          <b>Tk {total}</b>
        </div>
      </div>
    </div>
  );
}







