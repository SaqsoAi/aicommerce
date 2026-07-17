"use client";

type Brand = {
  id: string;
  name: string;
  logo?: string;
};

type Props = {
  brands: Brand[];
  onDelete: (id: string) => void;
};

const SERVER = "http://localhost:5000";

export default function BrandTable({
  brands,
  onDelete,
}: Props) {
  if (!brands.length) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
        No Brands Found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full min-w-[720px]">
        <thead className="bg-zinc-100 dark:bg-zinc-950">
          <tr>
            <th className="p-4 text-left">Logo</th>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {brands.map((brand) => {
            const logo =
              brand.logo?.startsWith("/uploads")
                ? `${SERVER}${brand.logo}`
                : brand.logo;

            return (
              <tr
                key={brand.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <td className="p-4">
                  {logo ? (
                    <img
                      src={logo}
                      alt={brand.name}
                      className="h-16 w-16 rounded-2xl bg-white object-contain p-2 dark:bg-zinc-950"
                    />
                  ) : (
                    <span className="text-zinc-400">No Logo</span>
                  )}
                </td>

                <td className="p-4 font-semibold">
                  {brand.name}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => onDelete(brand.id)}
                    className="rounded-xl bg-red-500 px-4 py-2 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
