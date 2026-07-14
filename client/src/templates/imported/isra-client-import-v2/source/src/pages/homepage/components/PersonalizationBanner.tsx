"use client";

import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const PersonalizationBanner = () => {
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Mock user data and recommendations
  const mockUserData = {
    name: 'Sarah',
    preferences: ['casual', 'sustainable', 'minimalist'],
    lastVisit: '2025-08-25'
  };

  const mockRecommendations = [
    {
      id: 1,
      name: 'Organic Cotton Tee',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
      category: 'Tops',
      reason: 'Based on your sustainable preferences'
    },
    {
      id: 2,
      name: 'High-Waist Denim',
      price: 89.99,
      image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?w=300&h=400&fit=crop',
      category: 'Bottoms',
      reason: 'Perfect for your casual style'
    },
    {
      id: 3,
      name: 'Minimalist Blazer',
      price: 129.99,
      image: 'https://images.pixabay.com/photo/2016/12/06/09/31/woman-1886838_1280.jpg?w=300&h=400&fit=crop',
      category: 'Outerwear',
      reason: 'Matches your minimalist aesthetic'
    }
  ];

  useEffect(() => {
    // Simulate checking for returning user
    const checkReturningUser = () => {
      const lastVisit = localStorage.getItem('lastVisit');
      if (lastVisit) {
        setIsReturningUser(true);
        setUserName(mockUserData?.name);
        setRecommendations(mockRecommendations);
      }
    };

    checkReturningUser();
  }, []);

  const handleProductClick = (productId) => {
    window.location.href = '/product-detail-page';
  };

  const handleViewAll = () => {
    window.location.href = '/product-catalog';
  };

  if (!isReturningUser) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-secondary/10 to-accent/10 py-8 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="Sparkles" size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">
                Welcome back, {userName}!
              </h2>
              <p className="text-text-secondary text-sm">
                We've curated some new pieces just for you
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
            iconName="ArrowRight"
            iconPosition="right"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations?.map((product) => (
            <div
              key={product?.id}
              onClick={() => handleProductClick(product?.id)}
              className="bg-card rounded-lg shadow-brand hover:shadow-brand-lg transition-brand cursor-pointer group overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={product?.image}
                  alt={product?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Icon name="Heart" size={16} className="text-text-secondary hover:text-cta transition-colors" />
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-primary group-hover:text-secondary transition-colors">
                      {product?.name}
                    </h3>
                    <p className="text-sm text-text-secondary">{product?.category}</p>
                  </div>
                  <span className="font-semibold text-primary">${product?.price}</span>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Icon name="Target" size={14} className="text-secondary" />
                  <p className="text-xs text-text-secondary">{product?.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
          <Button variant="ghost" size="sm" iconName="Clock" iconPosition="left">
            Recently Viewed
          </Button>
          <Button variant="ghost" size="sm" iconName="Heart" iconPosition="left">
            Your Wishlist
          </Button>
          <Button variant="ghost" size="sm" iconName="ShoppingBag" iconPosition="left">
            Reorder Favorites
          </Button>
          <Button variant="ghost" size="sm" iconName="Settings" iconPosition="left">
            Update Preferences
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PersonalizationBanner;