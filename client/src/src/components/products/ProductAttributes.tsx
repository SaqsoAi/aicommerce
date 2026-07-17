type MetaRow = {
  name?: string;
  value?: string;
};

type Props = {
  attributes?: MetaRow[];
};

export default function ProductAttributes({
  attributes = [],
}: Props) {
  if (!Array.isArray(attributes) || attributes.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-5 text-2xl font-bold">
        Attributes
      </h2>

      <div className="flex flex-wrap gap-3">
        {attributes.map((item, index) => (
          <div
            key={index}
            className="rounded-full bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-900"
          >
            <span className="font-semibold">
              {item.name}:
            </span>{" "}
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}

