"use client";

import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RecommendationEngine = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'For You', icon: 'Sparkles' },
    { id: 'trending', name: 'Trending', icon: 'TrendingUp' },
    { id: 'similar', name: 'Similar Items', icon: 'Copy' },
    { id: 'complete', name: 'Complete Look', icon: 'Shirt' }
  ];

  const mockRecommendations = {
    all: [
      {
        id: 1,
        name: 'Silk Wrap Blouse',
        price: 89.99,
        originalPrice: 119.99,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
        category: 'Tops',
        rating: 4.8,
        reviews: 124,
        reason: 'Based on your recent browsing',
        badge: 'Recommended',
        colors: ['#F5F5DC', '#FFB6C1', '#E6E6FA'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
      },
      {
        id: 2,
        name: 'High-Waist Tailored Pants',
        price: 129.99,
        image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=300&h=400&fit=crop',
        category: 'Bottoms',
        rating: 4.6,
        reviews: 89,
        reason: 'Pairs well with your recent purchase',
        badge: 'Perfect Match',
        colors: ['#000000', '#2F4F4F', '#8B4513'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
      },
      {
        id: 3,
        name: 'Sustainable Cotton Dress',
        price: 79.99,
        image: 'https://images.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg?w=300&h=400&fit=crop',
        category: 'Dresses',
        rating: 4.9,
        reviews: 156,
        reason: 'Matches your sustainable preferences',
        badge: 'Eco-Friendly',
        colors: ['#228B22', '#F0E68C', '#DDA0DD'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
      },
      {
        id: 4,
        name: 'Minimalist Leather Bag',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
        category: 'Accessories',
        rating: 4.7,
        reviews: 203,
        reason: 'Complements your minimalist style',
        badge: 'Style Match',
        colors: ['#8B4513', '#000000', '#F5F5DC'],
        sizes: ['One Size']
      }
    ],
    trending: [
      {
        id: 5,
        name: 'Oversized Blazer',
        price: 149.99,
        image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=300&h=400&fit=crop',
        category: 'Outerwear',
        rating: 4.8,
        reviews: 312,
        reason: 'Trending this week',
        badge: 'Hot Trend',
        colors: ['#2F4F4F', '#8B4513', '#F5F5DC'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
      },
      {
        id: 6,
        name: 'Statement Earrings',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=400&fit=crop',
        category: 'Jewelry',
        rating: 4.5,
        reviews: 78,
        reason: 'Popular among style enthusiasts',
        badge: 'Trending',
        colors: ['#FFD700', '#C0C0C0', '#CD7F32'],
        sizes: ['One Size']
      }
    ],
    similar: [
      {
        id: 7,
        name: 'Classic White Shirt',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
        category: 'Tops',
        rating: 4.6,
        reviews: 145,
        reason: 'Similar to items you viewed',
        badge: 'Similar Style',
        colors: ['#FFFFFF', '#F0F8FF', '#F5F5DC'],
        sizes: ['XS', 'S', 'M', 'L', 'XL']
      }
    ],
    complete: [
      {
        id: 8,
        name: 'Block Heel Pumps',
        price: 119.99,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?w=300&h=400&fit=crop',
        category: 'Shoes',
        rating: 4.7,
        reviews: 167,
        reason: 'Complete your professional look',
        badge: 'Complete Look',
        colors: ['#000000', '#8B4513', '#2F4F4F'],
        sizes: ['5', '6', '7', '8', '9', '10', '11']
      }
    ]
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRecommendations(mockRecommendations?.[selectedCategory] || mockRecommendations?.all);
      setIsLoading(false);
    }, 500);
  }, [selectedCategory]);

  const handleProductClick = (productId) => {
    window.location.href = '/product-detail-page';
  };

  const handleAddToCart = (productId, event) => {
    event?.stopPropagation();
    console.log(`Added product ${productId} to cart`);
  };

  const handleAddToWishlist = (productId, event) => {
    event?.stopPropagation();
    console.log(`Added product ${productId} to wishlist`);
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Recommended': 'bg-secondary',
      'Perfect Match': 'bg-cta',
      'Eco-Friendly': 'bg-success',
      'Style Match': 'bg-accent',
      'Hot Trend': 'bg-warning',
      'Trending': 'bg-primary',
      'Similar Style': 'bg-muted',
      'Complete Look': 'bg-secondary'
    };
    return colors?.[badge] || 'bg-primary';
  };

  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Complete Your Look
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Personalized recommendations based on your style preferences and browsing history
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center mb-8">
          <div className="bg-card rounded-lg p-1 shadow-brand overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              {categories?.map((category) => (
                <button
                  key={category?.id}
                  onClick={() => setSelectedCategory(category?.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category?.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-text-secondary hover:text-primary hover:bg-surface'
                  }`}
                >
                  <Icon name={category?.icon} size={16} />
                  <span>{category?.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="relative">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 })?.map((_, index) => (
                <div key={index} className="bg-card rounded-lg p-4 shadow-brand animate-pulse">
                  <div className="bg-surface h-48 rounded-lg mb-4" />
                  <div className="bg-surface h-4 rounded mb-2" />
                  <div className="bg-surface h-4 rounded w-2/3 mb-2" />
                  <div className="bg-surface h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations?.map((product) => (
                <div
                  key={product?.id}
                  onClick={() => handleProductClick(product?.id)}
                  className="bg-card rounded-lg shadow-brand hover:shadow-brand-lg transition-all duration-300 cursor-pointer group overflow-hidden hover-lift"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={product?.image}
                      alt={product?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`${getBadgeColor(product?.badge)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                        {product?.badge}
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => handleAddToWishlist(product?.id, e)}
                        className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                      >
                        <Icon name="Heart" size={16} className="text-text-secondary hover:text-cta" />
                      </button>
                    </div>

                    {/* Quick Add Button */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="default"
                        size="sm"
                        fullWidth
                        onClick={(e) => handleAddToCart(product?.id, e)}
                        className="bg-white/90 backdrop-blur-sm text-primary hover:bg-white"
                      >
                        Quick Add
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-primary group-hover:text-secondary transition-colors line-clamp-2">
                          {product?.name}
                        </h3>
                        <p className="text-sm text-text-secondary">{product?.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-primary">${product?.price}</span>
                        {product?.originalPrice && (
                          <span className="text-sm text-text-secondary line-through ml-1">
                            ${product?.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 })?.map((_, index) => (
                          <Icon
                            key={index}
                            name="Star"
                            size={12}
                            className={`${
                              index < Math.floor(product?.rating)
                                ? 'text-warning fill-current' :'text-border'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-text-secondary">
                        {product?.rating} ({product?.reviews})
                      </span>
                    </div>

                    {/* Recommendation Reason */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon name="Target" size={12} className="text-secondary" />
                      <p className="text-xs text-text-secondary">{product?.reason}</p>
                    </div>

                    {/* Color Options */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-text-secondary">Colors:</span>
                      <div className="flex space-x-1">
                        {product?.colors?.slice(0, 3)?.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        {product?.colors?.length > 3 && (
                          <span className="text-xs text-text-secondary">+{product?.colors?.length - 3}</span>
                        )}
                      </div>
                    </div>

                    {/* Size Availability */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-text-secondary">Sizes:</span>
                      <span className="text-xs text-primary">
                        {product?.sizes?.length > 3 
                          ? `${product?.sizes?.slice(0, 3)?.join(', ')} +${product?.sizes?.length - 3}`
                          : product?.sizes?.join(', ')
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View More */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/product-catalog'}
            iconName="ArrowRight"
            iconPosition="right"
            className="px-8"
          >
            View More Recommendations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecommendationEngine;