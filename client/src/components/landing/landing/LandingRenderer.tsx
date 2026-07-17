import type { PublicLandingPage, PublicLandingSection } from "@/api/landing.api";

function LandingSectionBlock({ section }: { section: PublicLandingSection }) {
  if (section.type === "hero") {
    return (
      <section className="relative overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-20 text-white md:px-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-300">
            Campaign Landing
          </p>
          <h1 className="text-4xl font-bold md:text-6xl">{section.title}</h1>
          {section.subtitle ? (
            <p className="mt-6 max-w-2xl text-lg text-neutral-200">{section.subtitle}</p>
          ) : null}
          <a
            href={String(section.configJson?.buttonLink || "/shop")}
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black"
          >
            {String(section.configJson?.buttonText || "Shop Now")}
          </a>
        </div>
      </section>
    );
  }

  if (section.type === "product-grid") {
    return (
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">{section.title || "Featured Products"}</h2>
          {section.subtitle ? <p className="mt-2 text-neutral-600">{section.subtitle}</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border bg-neutral-50 p-4">
              <div className="aspect-square rounded-xl bg-neutral-200" />
              <h3 className="mt-4 font-semibold">Campaign Product</h3>
              <p className="text-sm text-neutral-500">Connected with Campaign Module</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "cta") {
    return (
      <section className="rounded-[2rem] bg-neutral-100 p-10 text-center">
        <h2 className="text-3xl font-bold">{section.title}</h2>
        {section.subtitle ? <p className="mt-3 text-neutral-600">{section.subtitle}</p> : null}
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border bg-white p-10 shadow-sm">
      <h2 className="text-3xl font-bold">{section.title}</h2>
      {section.subtitle ? <p className="mt-3 text-neutral-600">{section.subtitle}</p> : null}
    </section>
  );
}

export default function LandingRenderer({ landing }: { landing: PublicLandingPage }) {
  const sortedSections = [...(landing.sections || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      {sortedSections.length > 0 ? (
        sortedSections.map((section) => (
          <LandingSectionBlock key={section.id} section={section} />
        ))
      ) : (
        <section className="rounded-[2rem] bg-neutral-950 px-6 py-20 text-white md:px-12">
          <h1 className="text-4xl font-bold md:text-6xl">{landing.title}</h1>
          {landing.description ? (
            <p className="mt-6 max-w-2xl text-lg text-neutral-200">{landing.description}</p>
          ) : null}
        </section>
      )}
    </main>
  );
}
