type Props = {
  title: string;
  message: string;
};

export default function HomepageRuntimeState({ title, message }: Props) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <section className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{message}</p>
      </section>
    </main>
  );
}
