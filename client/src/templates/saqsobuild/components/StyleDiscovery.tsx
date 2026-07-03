export default function StyleDiscovery({
  data,
}: {
  data?: {
    title?: string;
    description?: string;
  };
}) {
  return (
    <section className='bg-white px-6 py-12 sm:py-16 lg:py-20 text-zinc-950 dark:bg-black dark:text-white'>
      <div className='mx-auto grid max-w-7xl gap-10 md:grid-cols-1 sm:grid-cols-2'>
        <div>
          <p className='text-sm uppercase tracking-widest text-amber-600 dark:text-amber-300'>
            Style Discovery
          </p>

          <h2 className='mt-3 text-2xl sm:text-3xl lg:text-4xl font-black sm:text-3xl sm:text-2xl sm:text-3xl lg:text-4xl lg:text-5xl'>
            {data?.title ||
              'Build Your Perfect Look'}
          </h2>

          <p className='mt-5 text-zinc-600 dark:text-zinc-300'>
            {data?.description ||
              'Explore outfit combinations, style stories and fashion inspiration.'}
          </p>

          <a
            href='/style-quiz'
            className='mt-8 inline-block rounded-full bg-zinc-950 px-7 py-4 font-semibold text-white dark:bg-white dark:text-black'
          >
            Start Style Quiz
          </a>
        </div>

        <div className='grid gap-4 sm:grid-cols-1 sm:grid-cols-2'>
          {['Top', 'Bottom', 'Shoes', 'Accessories'].map((item) => (
            <div
              key={item}
              className='rounded-[2rem] border border-zinc-200 bg-zinc-100 p-6 dark:border-zinc-800 dark:bg-zinc-950'
            >
              <div className='h-48 rounded-2xl bg-zinc-300 dark:bg-zinc-800' />
              <h3 className='mt-4 text-xl font-bold'>
                {item}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
