import ShopTheLook from "./ShopTheLook";

type Item = {
  id: string;
  image: string;
  title?: string;
  caption?: string;
  products?: any[];
};

export default function LookbookDetail({ lookbook }: { lookbook: any }) {
  return (
    <main className="bg-white text-black">
      <section
        className="flex min-h-[80vh] items-end bg-black bg-cover bg-center px-4 py-16 text-white"
        style={{
          backgroundImage: lookbook.coverImage ? `linear-gradient(to top, rgba(0,0,0,.7), transparent), url(${lookbook.coverImage})` : undefined,
        }}
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.45em] text-white/70">Lookbook</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold md:text-7xl">{lookbook.title}</h1>
          {lookbook.description && <p className="mt-5 max-w-2xl text-white/75">{lookbook.description}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-16 px-4 py-16">
        {lookbook.items?.map((item: Item, index: number) => (
          <article key={item.id} className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
            <div
              className="min-h-[720px] rounded-2xl bg-neutral-100 bg-cover bg-center"
              style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }}
            />
            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Look {index + 1}</p>
              <h2 className="mt-4 text-3xl font-semibold">{item.title || lookbook.title}</h2>
              {item.caption && <p className="mt-4 text-neutral-600">{item.caption}</p>}

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/size-fit-center" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
                  AI Style Match
                </a>
                <a href="/shop" className="rounded-full border px-5 py-3 text-sm font-semibold">
                  Virtual Try-On
                </a>
              </div>

              <ShopTheLook products={item.products ?? []} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

