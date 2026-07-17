type SocialFeedSettings = {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  platforms?: string[];
  facebookEnabled?: boolean;
  instagramEnabled?: boolean;
  facebookPageUrl?: string;
  instagramUrl?: string;
  posts?: unknown[];
};

export default function SaqsoSocialFeeds({
  settings,
}: {
  settings: SocialFeedSettings;
}) {
  const platforms = settings?.platforms || [];
  const facebookEnabled =
    settings?.facebookEnabled || platforms.includes("facebook");
  const instagramEnabled =
    settings?.instagramEnabled || platforms.includes("instagram");

  if (settings?.enabled === false || (!facebookEnabled && !instagramEnabled)) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Social
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black">
          {settings?.title || "Facebook & Instagram Feed"}
        </h2>
        {settings?.subtitle && (
          <p className="mt-3 max-w-2xl text-zinc-500 dark:text-zinc-400">
            {settings.subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-1 sm:grid-cols-2">
        {facebookEnabled && (
          <div className="rounded-3xl border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-2xl font-black">Facebook</h3>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              {settings.facebookPageUrl || "Add Facebook page from admin."}
            </p>
          </div>
        )}

        {instagramEnabled && (
          <div className="rounded-3xl border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-2xl font-black">Instagram</h3>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              {settings.instagramUrl || "Add Instagram profile from admin."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
