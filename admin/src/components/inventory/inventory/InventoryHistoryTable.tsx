"use client";

type History = {
  id: string;
  transactionType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  createdAt: string;
};

type Props = {
  data: History[];
};

export default function InventoryHistoryTable({
  data,
}: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-100">
          <tr>
            <th className="p-4 text-left">
              Type
            </th>

            <th className="p-4 text-left">
              Qty
            </th>

            <th className="p-4 text-left">
              Previous
            </th>

            <th className="p-4 text-left">
              New
            </th>

            <th className="p-4 text-left">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-t"
            >
              <td className="p-4">
                {row.transactionType}
              </td>

              <td className="p-4">
                {row.quantity}
              </td>

              <td className="p-4">
                {row.previousStock}
              </td>

              <td className="p-4">
                {row.newStock}
              </td>

              <td className="p-4">
                {new Date(
                  row.createdAt
                ).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}