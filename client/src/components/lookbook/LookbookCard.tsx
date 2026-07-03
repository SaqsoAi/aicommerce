import Link from "next/link";

type Props = {
  title: string;
  slug: string;
  coverImage?: string;
  description?: string;
};

export default function LookbookCard({
  title,
  slug,
  coverImage,
  description,
}: Props) {
  return (
    <div className="group overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-950">
      <Link href={`/lookbook/${slug}`}>
        <div
          className="h-[520px] bg-neutral-100 bg-cover bg-center transition duration-700 group-hover:scale-105"
          style={{
            backgroundImage: coverImage
              ? `url(${coverImage})`
              : undefined,
          }}
        />
      </Link>

      <div className="space-y-4 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
          Shop the story
        </p>

        <h2 className="text-2xl font-semibold">
          {title}
        </h2>

        {description && (
          <p className="line-clamp-2 text-sm text-neutral-500">
            {description}
          </p>
        )}

        <div className="flex gap-2">
          <Link
            href={`/lookbook/${slug}`}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            View Story
          </Link>

          <Link
            href="/virtual-tryon"
            className="rounded-full border px-4 py-2 text-sm font-semibold"
          >
            Try-On
          </Link>

          <Link
            href="/shop"
            className="rounded-full border px-4 py-2 text-sm font-semibold"
          >
            Shop Look
          </Link>
        </div>
      </div>
    </div>
  );
}
