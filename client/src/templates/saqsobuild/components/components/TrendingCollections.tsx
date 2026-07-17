export default function TrendingCollections({
  data,
}: {
  data?: any;
}) {
  const collections =
    data?.collections || [
      {
        title: 'New Arrivals',
        subtitle: 'Fresh styles for the season',
        image:
          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop',
      },
      {
        title: 'Seasonal Essentials',
        subtitle: 'Wardrobe must-haves',
        image:
          'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=800&h=1000&fit=crop',
      },
      {
        title: 'Sustainable Picks',
        subtitle: 'Eco-conscious fashion',
        image:
          'https://images.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg?w=800&h=1000&fit=crop',
      },
    ];

  return (
    <section className='bg-zinc-950 px-6 py-20 text-white'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-10 flex items-end justify-between gap-6'>
          <div>
            <p className='text-sm uppercase tracking-widest text-amber-300'>
              Trending Collections
            </p>
            <h2 className='mt-3 text-4xl font-black'>
              Shop The Mood
            </h2>
          </div>

          <a
            href='/shop'
            className='hidden rounded-full border border-white/20 px-5 py-3 text-sm md:block'
          >
            View All
          </a>
        </div>

        <div className='grid gap-6 md:grid-cols-3'>
          {collections.map((item: any) => (
            <a
              key={item.title}
              href='/shop'
              className='group relative min-h-[460px] overflow-hidden rounded-[2rem]'
            >
              <img
                src={item.image}
                alt={item.title}
                className='absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110'
              />

              <div className='absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent' />

              <div className='absolute bottom-0 p-7'>
                <h3 className='text-3xl font-black'>
                  {item.title}
                </h3>
                <p className='mt-2 text-zinc-300'>
                  {item.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


