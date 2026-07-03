type MetaRow = {
  name?: string;
  value?: string;
};

type Props = {
  specifications?: MetaRow[];
};

export default function ProductSpecifications({
  specifications = [],
}: Props) {
  if (!Array.isArray(specifications) || specifications.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-5 text-2xl font-bold">
        Specifications
      </h2>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {specifications.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-4 py-3"
          >
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              {item.name}
            </span>
            <span className="text-zinc-900 dark:text-zinc-100">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

