"use client";

export default function SearchResults({
  results,
}: {
  results: any;
}) {
  if (!results)
    return null;

  return (
    <div
      className="
      grid
      md:grid-cols-3
      gap-6
    "
    >
      <div
        className="
        border
        rounded-2xl
        p-4
      "
      >
        <h3 className="font-bold mb-4">
          Products
        </h3>

        {results.products?.map(
          (item: any) => (
            <div
              key={item.id}
            >
              {item.name}
            </div>
          )
        )}
      </div>

      <div
        className="
        border
        rounded-2xl
        p-4
      "
      >
        <h3 className="font-bold mb-4">
          Brands
        </h3>

        {results.brands?.map(
          (item: any) => (
            <div
              key={item.id}
            >
              {item.name}
            </div>
          )
        )}
      </div>

      <div
        className="
        border
        rounded-2xl
        p-4
      "
      >
        <h3 className="font-bold mb-4">
          Customers
        </h3>

        {results.customers?.map(
          (item: any) => (
            <div
              key={item.id}
            >
              {item.name}
            </div>
          )
        )}
      </div>
    </div>
  );
}