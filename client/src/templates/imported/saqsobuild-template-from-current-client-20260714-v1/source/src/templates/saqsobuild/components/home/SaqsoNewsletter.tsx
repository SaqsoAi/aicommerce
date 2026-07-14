export default function SaqsoNewsletter() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-[2rem] bg-zinc-100 p-8 dark:bg-zinc-900">
        <h2 className="text-4xl font-black">Join SAQSO Updates</h2>
        <p className="mt-3 text-zinc-500">Get new arrivals, rewards, membership updates and exclusive offers.</p>
        <div className="mt-6 flex max-w-xl gap-3">
          <input placeholder="Email address" className="flex-1 rounded-full border px-5 py-4 dark:border-zinc-800 dark:bg-black" />
          <button className="rounded-full bg-black px-7 py-4 font-bold text-white dark:bg-white dark:text-black">Subscribe</button>
        </div>
      </div>
    </section>
  );
}


