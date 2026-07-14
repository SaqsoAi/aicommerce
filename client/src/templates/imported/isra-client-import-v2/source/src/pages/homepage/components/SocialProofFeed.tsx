"use client";

import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const SocialProofFeed = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const userPosts = [
    {
      id: 1,
      username: '@sarah_styles',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop',
      caption: 'Obsessed with this new blazer from @stylehub! Perfect for work meetings ✨ #StyleHubLook #WorkWear',
      likes: 234,
      comments: 18,
      timeAgo: '2h',
      products: [
        { name: 'Structured Blazer', price: 129.99, id: 1 },
        { name: 'High-Waist Trousers', price: 89.99, id: 2 }
      ]
    },
    {
      id: 2,
      username: '@mike_fashion',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400&h=500&fit=crop',
      caption: 'Weekend vibes in this cozy knit 🧶 Quality is amazing! #StyleHubLook #WeekendStyle',
      likes: 189,
      comments: 12,
      timeAgo: '4h',
      products: [
        { name: 'Cashmere Blend Sweater', price: 149.99, id: 3 }
      ]
    },
    {
      id: 3,
      username: '@emma_chic',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      image: 'https://images.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg?w=400&h=500&fit=crop',
      caption: 'Sustainable fashion that doesn\'t compromise on style 🌱 Love supporting eco-conscious brands! #StyleHubLook #SustainableFashion',
      likes: 312,
      comments: 25,
      timeAgo: '6h',
      products: [
        { name: 'Organic Cotton Dress', price: 79.99, id: 4 },
        { name: 'Recycled Material Bag', price: 59.99, id: 5 }
      ]
    },
    {
      id: 4,
      username: '@alex_minimal',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
      caption: 'Minimalist wardrobe essentials done right. Clean lines, perfect fit 👌 #StyleHubLook #MinimalistStyle',
      likes: 156,
      comments: 8,
      timeAgo: '8h',
      products: [
        { name: 'Essential White Tee', price: 29.99, id: 6 },
        { name: 'Tailored Trousers', price: 99.99, id: 7 }
      ]
    },
    {
      id: 5,
      username: '@lisa_trends',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=400&h=500&fit=crop',
      caption: 'Date night ready! This dress is everything 💫 The quality exceeded my expectations #StyleHubLook #DateNight',
      likes: 278,
      comments: 21,
      timeAgo: '12h',
      products: [
        { name: 'Midi Wrap Dress', price: 119.99, id: 8 },
        { name: 'Statement Earrings', price: 39.99, id: 9 }
      ]
    },
    {
      id: 6,
      username: '@david_street',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
      caption: 'Street style meets comfort. These pieces are perfect for city adventures 🏙️ #StyleHubLook #StreetStyle',
      likes: 203,
      comments: 15,
      timeAgo: '1d',
      products: [
        { name: 'Urban Jacket', price: 159.99, id: 10 },
        { name: 'Comfortable Sneakers', price: 89.99, id: 11 }
      ]
    }
  ];

  const postsPerPage = 3;
  const totalPages = Math.ceil(userPosts?.length / postsPerPage);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, totalPages]);

  const getCurrentPosts = () => {
    const startIndex = currentPage * postsPerPage;
    return userPosts?.slice(startIndex, startIndex + postsPerPage);
  };

  const handleProductClick = (productId) => {
    window.location.href = '/product-detail-page';
  };

  const handleUserClick = (username) => {
    console.log(`Clicked on user: ${username}`);
  };

  const handleLike = (postId) => {
    console.log(`Liked post: ${postId}`);
  };

  const handleComment = (postId) => {
    console.log(`Comment on post: ${postId}`);
  };

  const handleShare = (postId) => {
    console.log(`Share post: ${postId}`);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setIsAutoPlaying(false);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Instagram" size={24} className="text-secondary" />
            <h2 className="text-3xl sm:text-4xl font-bold text-primary">
              #StyleHubLook
            </h2>
          </div>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            See how our community styles their favorite pieces. Get inspired and shop the looks you love
          </p>
        </div>

        {/* Posts Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {getCurrentPosts()?.map((post) => (
              <div
                key={post?.id}
                className="bg-card rounded-2xl shadow-brand hover:shadow-brand-lg transition-all duration-300 overflow-hidden hover-lift"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center space-x-3">
                  <button
                    onClick={() => handleUserClick(post?.username)}
                    className="flex items-center space-x-3 flex-1 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={post?.userAvatar}
                      alt={post?.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <p className="font-medium text-primary text-sm">{post?.username}</p>
                      <p className="text-text-secondary text-xs">{post?.timeAgo}</p>
                    </div>
                  </button>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Icon name="MoreHorizontal" size={16} />
                  </Button>
                </div>

                {/* Post Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={post?.image}
                    alt="User style post"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Product Tags */}
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                      <Icon name="Tag" size={16} className="text-primary" />
                    </button>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post?.id)}
                        className="flex items-center space-x-1 hover:text-cta transition-colors"
                      >
                        <Icon name="Heart" size={20} className="text-text-secondary" />
                        <span className="text-sm font-medium">{post?.likes}</span>
                      </button>
                      <button
                        onClick={() => handleComment(post?.id)}
                        className="flex items-center space-x-1 hover:text-secondary transition-colors"
                      >
                        <Icon name="MessageCircle" size={20} className="text-text-secondary" />
                        <span className="text-sm font-medium">{post?.comments}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleShare(post?.id)}
                      className="hover:text-secondary transition-colors"
                    >
                      <Icon name="Share" size={20} className="text-text-secondary" />
                    </button>
                  </div>

                  {/* Caption */}
                  <p className="text-sm text-primary mb-3 leading-relaxed">
                    {post?.caption}
                  </p>

                  {/* Tagged Products */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                      Shop This Look
                    </p>
                    {post?.products?.map((product) => (
                      <button
                        key={product?.id}
                        onClick={() => handleProductClick(product?.id)}
                        className="flex items-center justify-between w-full p-2 bg-surface rounded-lg hover:bg-secondary/10 transition-colors"
                      >
                        <span className="text-sm font-medium text-primary">{product?.name}</span>
                        <span className="text-sm font-semibold text-secondary">${product?.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>

            {/* Page Indicators */}
            <div className="flex space-x-2">
              {Array.from({ length: totalPages })?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentPage(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? 'bg-secondary scale-125' :'bg-border hover:bg-secondary/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-primary mb-4">
            Share Your Style
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Tag us @stylehub and use #StyleHubLook to be featured in our community showcase
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              iconName="Camera"
              iconPosition="left"
            >
              Share Your Look
            </Button>
            <Button
              variant="outline"
              iconName="Instagram"
              iconPosition="left"
            >
              Follow @StyleHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofFeed;