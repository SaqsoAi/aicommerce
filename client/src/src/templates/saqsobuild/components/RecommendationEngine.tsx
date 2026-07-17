export default function RecommendationEngine({
  data,
}: {
  data?: {
    title?: string;
    description?: string;
  };
}) {
  return (
    <section className='bg-zinc-100 px-6 py-12 sm:py-16 lg:py-20 dark:bg-zinc-950'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-10 text-center'>
          <p className='text-sm uppercase tracking-widest text-amber-700 dark:text-amber-300'>
            AI Commerce
          </p>

          <h2 className='mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 dark:text-white'>
            {data?.title ||
              'Recommended For You'}
          </h2>

          <p className='mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300'>
            {data?.description ||
              'AI-powered product suggestions tailored for every customer.'}
          </p>
        </div>

        <div className='grid gap-6 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            'Silk Wrap Blouse',
            'Tailored Pants',
            'Premium Knit',
            'Minimal Bag',
          ].map((item) => (
            <div
              key={item}
              className='rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'
            >
              <div className='h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800' />
              <h3 className='mt-4 font-bold text-zinc-950 dark:text-white'>
                {item}
              </h3>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Recommended
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
