"use client";

import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const heroContent = [
    {
      id: 1,
      type: 'image',
      src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=800&fit=crop',
      alt: 'Diverse models wearing autumn collection',
      headline: 'Discover Your Style Story',
      subheadline: 'Curate your perfect wardrobe with pieces that speak to your unique aesthetic',
      primaryCta: 'Shop New Arrivals',
      secondaryCta: 'Take Style Quiz'
    },
    {
      id: 2,
      type: 'image',
      src: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=1920&h=800&fit=crop',
      alt: 'Seasonal winter essentials collection',
      headline: 'Winter Essentials Are Here',
      subheadline: 'Stay warm and stylish with our carefully curated cold-weather collection',
      primaryCta: 'Shop Winter Collection',
      secondaryCta: 'View Lookbook'
    },
    {
      id: 3,
      type: 'image',
      src: 'https://images.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg?w=1920&h=800&fit=crop',
      alt: 'Sustainable fashion collection showcase',
      headline: 'Style Without Compromise',
      subheadline: 'Discover our sustainable collection - fashion that feels good and does good',
      primaryCta: 'Shop Sustainable',
      secondaryCta: 'Learn More'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroContent?.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroContent?.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handlePrimaryCta = () => {
    window.location.href = '/product-catalog';
  };

  const handleSecondaryCta = () => {
    // Style quiz functionality would be implemented here
    console.log('Style quiz clicked');
  };

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-surface">
      {/* Hero Slides */}
      <div className="relative w-full h-full">
        {heroContent?.map((slide, index) => (
          <div
            key={slide?.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={slide?.src}
                alt={slide?.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    {slide?.headline}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
                    {slide?.subheadline}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handlePrimaryCta}
                      className="bg-cta hover:bg-cta/90 text-cta-foreground px-8 py-4 text-lg font-semibold"
                    >
                      {slide?.primaryCta}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleSecondaryCta}
                      className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold"
                    >
                      {slide?.secondaryCta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {heroContent?.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125' :'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center text-white/80">
        <span className="text-sm mb-2 rotate-90 origin-center whitespace-nowrap">Scroll to explore</span>
        <div className="w-px h-12 bg-white/40 animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;