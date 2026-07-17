export default function PersonalizationBanner({
  data,
}: {
  data?: any;
}) {
  return (
    <section className='bg-white px-6 py-16'>
      <div className='mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-zinc-200 bg-zinc-50 p-8 md:grid-cols-2'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-widest text-amber-600'>
            Personalized AI Styling
          </p>

          <h2 className='mt-3 text-4xl font-black text-zinc-950'>
            {data?.title ||
              'Made For Your Style'}
          </h2>

          <p className='mt-4 text-zinc-600'>
            {data?.description ||
              'Smart fashion recommendations based on your taste, browsing and lifestyle.'}
          </p>
        </div>

        <div className='grid gap-4 sm:md:grid-cols-3'>
          {[
            'Organic Tee',
            'High-Waist Denim',
            'Minimal Blazer',
          ].map((item) => (
            <div
              key={item}
              className='rounded-2xl bg-white p-4 shadow-sm'
            >
              <div className='h-28 rounded-xl bg-zinc-200' />
              <h3 className='mt-3 font-semibold'>
                {item}
              </h3>
              <p className='text-sm text-zinc-500'>
                AI Pick
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


