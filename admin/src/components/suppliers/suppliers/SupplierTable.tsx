"use client";

type Supplier = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  contactPerson?: string | null;
  active?: boolean;
};

type Props = {
  suppliers: Supplier[];
  onDelete: (id: string) => Promise<void>;
};

export default function SupplierTable({
  suppliers,
  onDelete,
}: Props) {
  if (suppliers.length === 0) {
    return (
      <div
        className="
        rounded-3xl
        border
        border-dashed
        border-zinc-300
        dark:border-zinc-700
        p-12
        text-center
        text-zinc-500
      "
      >
        No suppliers found
      </div>
    );
  }

  return (
    <div
      className="
      overflow-hidden
      rounded-3xl
      border
      border-zinc-200
      dark:border-zinc-800
      bg-white
      dark:bg-zinc-900
      text-zinc-900
      dark:text-zinc-100
      shadow-sm
    "
    >
      <table className="w-full">
        <thead className="bg-zinc-50 dark:bg-zinc-950">
          <tr>
            <th className="p-4 text-left">Supplier</th>
            <th className="p-4 text-left">Company</th>
            <th className="p-4 text-left">Contact</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.map((item) => (
            <tr
              key={item.id}
              className="
              border-t
              border-zinc-200
              dark:border-zinc-800
              hover:bg-zinc-50
              dark:hover:bg-zinc-800
            "
            >
              <td className="p-4 font-medium">
                {item.name}
                <div className="text-xs text-zinc-500">
                  {item.email || "-"}
                </div>
              </td>

              <td className="p-4">
                {item.companyName || "-"}
              </td>

              <td className="p-4">
                {item.contactPerson || "-"}
                <div className="text-xs text-zinc-500">
                  {item.phone || "-"}
                </div>
              </td>

              <td className="p-4">
                <span
                  className="
                  rounded-full
                  bg-green-100
                  px-3
                  py-1
                  text-xs
                  text-green-700
                  dark:bg-green-900/30
                  dark:text-green-300
                "
                >
                  {item.active === false
                    ? "Inactive"
                    : "Active"}
                </span>
              </td>

              <td className="p-4 text-right">
                <button
                  onClick={() => onDelete(item.id)}
                  className="
                  rounded-xl
                  bg-red-500
                  px-4
                  py-2
                  text-white
                  hover:bg-red-600
                "
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
