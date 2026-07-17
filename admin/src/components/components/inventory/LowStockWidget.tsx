"use client";

type Variant = {
  id: string;
  sku: string;
  stock: number;
};

type Props = {
  items: Variant[];
};

export default function LowStockWidget({
  items,
}: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow p-6">
      <h2 className="font-bold mb-4">
        Low Stock Alerts
      </h2>

      {items.length === 0 ? (
        <p>No alerts</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="border-b py-2"
          >
            <div>{item.sku}</div>

            <div>
              Stock: {item.stock}
            </div>
          </div>
        ))
      )}
    </div>
  );
}