"use client";

export default function LowStockWidget() {
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
    "
    >
      <h2
        className="
        text-xl
        font-bold
        mb-4
      "
      >
        Low Stock Alerts
      </h2>

      <div className="space-y-2">
        <div>T-Shirt Black XL</div>
        <div>Hoodie Blue L</div>
        <div>Jeans Slim Fit</div>
      </div>
    </div>
  );
}