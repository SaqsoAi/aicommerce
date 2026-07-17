"use client";

type Props = {
  items: any[];
};

export default function CheckoutAiInsights({ items }: Props) {
  const itemCount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const insights = [
    itemCount > 1
      ? `You have ${itemCount} items ready for checkout.`
      : "Add more items to unlock better styling combinations.",
    subtotal > 5000
      ? "This cart may qualify for membership benefits."
      : "Increase cart value to unlock higher membership rewards.",
    "Complete the order to improve your personalized recommendations.",
  ];

  return (
    <div className="rounded-[2rem] border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
        AI Cart Intelligence
      </p>

      <h2 className="mt-3 text-2xl font-black text-zinc-950 dark:text-slate-950 dark:text-white">
        Smart checkout insights
      </h2>

      <div className="mt-5 space-y-3">
        {insights.map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-zinc-50 p-4 sm:p-5 text-sm sm:text-[15px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

