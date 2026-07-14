"use client";

import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TrendingCollections = () => {
  const [hoveredCollection, setHoveredCollection] = useState(null);

  const collections = [
    {
      id: 1,
      title: 'New Arrivals',
      subtitle: 'Fresh styles for the season',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop',
      badge: 'Just In',
      itemCount: '120+ pieces',
      keyPieces: ['Oversized Blazers', 'Midi Dresses', 'Statement Accessories'],
      color: 'bg-cta'
    },
    {
      id: 2,
      title: 'Seasonal Essentials',
      subtitle: 'Winter wardrobe must-haves',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=600&h=800&fit=crop',
      hoverImage: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=600&h=800&fit=crop',
      badge: 'Trending',
      itemCount: '85+ pieces',
      keyPieces: ['Cozy Knits', 'Wool Coats', 'Thermal Layers'],
      color: 'bg-secondary'
    },
    {
      id: 3,
      title: 'Sustainable Picks',
      subtitle: 'Eco-conscious fashion choices',
      image: 'https://images.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg?w=600&h=800&fit=crop',
      hoverImage: 'https://images.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg?w=600&h=800&fit=crop',
      badge: 'Eco-Friendly',
      itemCount: '60+ pieces',
      keyPieces: ['Organic Cotton', 'Recycled Materials', 'Fair Trade'],
      color: 'bg-success'
    },
    {
      id: 4,
      title: 'Work & Weekend',
      subtitle: 'Versatile pieces for every occasion',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
      badge: 'Versatile',
      itemCount: '95+ pieces',
      keyPieces: ['Blazer Dresses', 'Comfortable Flats', 'Day-to-Night'],
      color: 'bg-accent'
    },
    {
      id: 5,
      title: 'Statement Pieces',
      subtitle: 'Bold looks that turn heads',
      image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=600&h=800&fit=crop',
      hoverImage: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=600&h=800&fit=crop',
      badge: 'Bold',
      itemCount: '45+ pieces',
      keyPieces: ['Sequin Tops', 'Printed Dresses', 'Bold Accessories'],
      color: 'bg-warning'
    },
    {
      id: 6,
      title: 'Minimalist Edit',
      subtitle: 'Clean lines and timeless appeal',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
      badge: 'Timeless',
      itemCount: '70+ pieces',
      keyPieces: ['Neutral Tones', 'Classic Cuts', 'Quality Basics'],
      color: 'bg-primary'
    }
  ];

  const handleCollectionClick = (collectionId) => {
    window.location.href = '/product-catalog';
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Trending Collections
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover curated collections that define this season's style narrative
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections?.map((collection) => (
            <div
              key={collection?.id}
              className="group cursor-pointer"
              onClick={() => handleCollectionClick(collection?.id)}
              onMouseEnter={() => setHoveredCollection(collection?.id)}
              onMouseLeave={() => setHoveredCollection(null)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-brand hover:shadow-brand-lg transition-all duration-500 hover-lift">
                {/* Collection Image */}
                <div className="relative h-96 overflow-hidden">
                  <Image
                    src={hoveredCollection === collection?.id ? collection?.hoverImage : collection?.image}
                    alt={collection?.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`${collection?.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                      {collection?.badge}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                      <Icon name="Heart" size={18} className="text-text-secondary hover:text-cta" />
                    </button>
                  </div>
                </div>

                {/* Collection Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-1">{collection?.title}</h3>
                    <p className="text-white/80 text-sm">{collection?.subtitle}</p>
                    <p className="text-white/60 text-xs mt-1">{collection?.itemCount}</p>
                  </div>

                  {/* Key Pieces - Show on Hover */}
                  <div className={`transition-all duration-300 ${
                    hoveredCollection === collection?.id 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-0 transform translate-y-4'
                  }`}>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {collection?.keyPieces?.map((piece, index) => (
                        <span
                          key={index}
                          className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full"
                        >
                          {piece}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className={`transition-all duration-300 ${
                    hoveredCollection === collection?.id 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-0 transform translate-y-4'
                  }`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white hover:text-primary"
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      Explore Collection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Collections */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/product-catalog'}
            iconName="Grid3X3"
            iconPosition="left"
            className="px-8"
          >
            View All Collections
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingCollections;