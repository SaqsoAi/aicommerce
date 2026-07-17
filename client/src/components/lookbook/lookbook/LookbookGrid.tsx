import LookbookCard from "./LookbookCard";

type Lookbook = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
};

export default function LookbookGrid({ lookbooks }: { lookbooks: Lookbook[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid gap-6 md:grid-cols-2">
        {lookbooks.map((item) => (
          <LookbookCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}
