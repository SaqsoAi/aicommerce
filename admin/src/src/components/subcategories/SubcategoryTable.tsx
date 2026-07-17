"use client";

type Props = {
  subcategories: any[];
  onDelete: (
    id: string
  ) => Promise<void>;
};

export default function SubcategoryTable({
  subcategories,
  onDelete,
}: Props) {
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
    "
    >
      <table className="w-full">
        <thead>
          <tr>
            <th className="p-4 text-left">
              Name
            </th>

            <th className="p-4 text-left">
              Category
            </th>

            <th className="p-4 text-right">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {(Array.isArray(subcategories) ? subcategories : []).map(
            (item) => (
              <tr
                key={item.id}
                className="
                border-t
                border-zinc-200
                dark:border-zinc-800
              "
              >
                <td className="p-4">
                  {item.name}
                </td>

                <td className="p-4">
                  {item.category?.name}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() =>
                      onDelete(
                        item.id
                      )
                    }
                    className="
                    px-4
                    py-2
                    rounded-xl
                    bg-red-500
                    text-white
                  "
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
