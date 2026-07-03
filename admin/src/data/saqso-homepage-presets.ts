export const saqsoHomepagePresets = [
  {
    title: 'Saqso Announcement',
    slug: 'saqso-announcement',
    type: 'ANNOUNCEMENT',
    enabled: true,
    sortOrder: 1,
    data: {
      text: 'Free delivery on selected fashion essentials',
      link: '/shop',
    },
  },
  {
    title: 'Saqso Hero',
    slug: 'saqso-hero',
    type: 'HERO',
    enabled: true,
    sortOrder: 2,
    data: {
      headline: 'Discover Your Style Story',
      subheadline:
        'Curate your wardrobe with premium fashion pieces made for your lifestyle.',
      primaryCta: 'Shop New Arrivals',
      secondaryCta: 'Take Style Quiz',
      image:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=900&fit=crop',
    },
  },
  {
    title: 'Personalized Picks',
    slug: 'personalized-picks',
    type: 'PERSONALIZATION',
    enabled: true,
    sortOrder: 3,
    data: {
      title: 'Made For Your Style',
      description:
        'Smart fashion recommendations based on your mood, taste and shopping journey.',
    },
  },
  {
    title: 'Trending Collections',
    slug: 'trending-collections',
    type: 'TRENDING_COLLECTIONS',
    enabled: true,
    sortOrder: 4,
    data: {
      collections: [
        {
          title: 'New Arrivals',
          subtitle: 'Fresh styles for the season',
          image:
            'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop',
        },
        {
          title: 'Winter Essentials',
          subtitle: 'Warm, refined and effortless',
          image:
            'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=800&h=1000&fit=crop',
        },
        {
          title: 'Sustainable Picks',
          subtitle: 'Conscious fashion choices',
          image:
            'https://images.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg?w=800&h=1000&fit=crop',
        },
      ],
    },
  },
  {
    title: 'Style Discovery',
    slug: 'style-discovery',
    type: 'STYLE_DISCOVERY',
    enabled: true,
    sortOrder: 5,
    data: {
      title: 'Build Your Perfect Look',
      description:
        'Explore outfit combinations, style stories and fashion inspiration.',
    },
  },
  {
    title: 'AI Recommendations',
    slug: 'ai-recommendations',
    type: 'RECOMMENDATION_ENGINE',
    enabled: true,
    sortOrder: 6,
    data: {
      title: 'Recommended For You',
      description:
        'AI-powered product suggestions tailored for every customer.',
    },
  },
  {
    title: 'Social Proof',
    slug: 'social-proof',
    type: 'SOCIAL_PROOF',
    enabled: true,
    sortOrder: 7,
    data: {
      title: 'Styled By Our Community',
      description:
        'Real customers, real outfits, real inspiration.',
    },
  },
  {
    title: 'Sustainability',
    slug: 'sustainability',
    type: 'SUSTAINABILITY',
    enabled: true,
    sortOrder: 8,
    data: {
      title: 'Style Without Compromise',
      description:
        'Better materials, ethical partners and responsible fashion choices.',
    },
  },
  {
    title: 'Newsletter',
    slug: 'saqso-newsletter',
    type: 'NEWSLETTER',
    enabled: true,
    sortOrder: 9,
    data: {
      title: 'Join Saqso Style Club',
      description:
        'Get new drops, offers and AI style recommendations first.',
    },
  },
];
