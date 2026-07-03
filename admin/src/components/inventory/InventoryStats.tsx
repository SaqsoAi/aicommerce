"use client";

type Props = {
  totalVariants: number;
  lowStock: number;
  outOfStock: number;
};

export default function InventoryStats({
  totalVariants,
  lowStock,
  outOfStock,
}: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow">
        <h3 className="text-sm text-gray-500">
          Total Variants
        </h3>

        <p className="text-3xl font-bold">
          {totalVariants}
        </p>
      </div>

      <div className="bg-yellow-50 p-6 rounded-2xl shadow">
        <h3 className="text-sm">
          Low Stock
        </h3>

        <p className="text-3xl font-bold">
          {lowStock}
        </p>
      </div>

      <div className="bg-red-50 p-6 rounded-2xl shadow">
        <h3 className="text-sm">
          Out Of Stock
        </h3>

        <p className="text-3xl font-bold">
          {outOfStock}
        </p>
      </div>
    </div>
  );
}