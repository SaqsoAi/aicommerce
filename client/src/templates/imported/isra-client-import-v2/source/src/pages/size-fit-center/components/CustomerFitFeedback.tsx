"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerFitFeedback = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterSize, setFilterSize] = useState('all');
  const [filterFit, setFilterFit] = useState('all');

  const customerReviews = [
    {
      id: 1,
      productName: 'Classic White Button Shirt',
      customerName: 'Sarah M.',
      size: 'M',
      height: '5\'6"',
      bodyType: 'Hourglass',
      fitRating: 'Perfect',
      review: 'Fits exactly as expected! The medium is perfect for my measurements. The fabric has a nice drape and the sleeves are the right length.',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=150&h=200&fit=crop&crop=center',
      customerPhoto: 'https://randomuser.me/api/portraits/women/32.jpg',
      helpful: 24,
      verified: true,
      date: '2024-08-15'
    },
    {
      id: 2,
      productName: 'Classic White Button Shirt',
      customerName: 'Emma L.',
      size: 'S',
      height: '5\'4"',
      bodyType: 'Pear',
      fitRating: 'Slightly loose',
      review: 'I usually wear small but this runs a bit large. The fit through the shoulders is good but it\'s loose around the waist. Still love the quality!',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=150&h=200&fit=crop&crop=center',
      customerPhoto: 'https://randomuser.me/api/portraits/women/45.jpg',
      helpful: 18,
      verified: true,
      date: '2024-08-12'
    },
    {
      id: 3,
      productName: 'Floral Summer Dress',
      customerName: 'Jessica R.',
      size: 'L',
      height: '5\'8"',
      bodyType: 'Rectangle',
      fitRating: 'Perfect',
      review: 'Beautiful dress! The large fits perfectly - not too tight, not too loose. The length is great for my height and the fabric is so comfortable.',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150&h=200&fit=crop&crop=center',
      customerPhoto: 'https://randomuser.me/api/portraits/women/28.jpg',
      helpful: 31,
      verified: true,
      date: '2024-08-10'
    },
    {
      id: 4,
      productName: 'High-Waist Jeans',
      customerName: 'Maria K.',
      size: '29',
      height: '5\'5"',
      bodyType: 'Apple',
      fitRating: 'Runs small',
      review: 'These run smaller than expected. I usually wear 28 but needed 29. The high waist is flattering and the quality is excellent. Would recommend sizing up.',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=150&h=200&fit=crop&crop=center',
      customerPhoto: 'https://randomuser.me/api/portraits/women/51.jpg',
      helpful: 22,
      verified: true,
      date: '2024-08-08'
    },
    {
      id: 5,
      productName: 'Knit Sweater',
      customerName: 'Ashley T.',
      size: 'M',
      height: '5\'7"',
      bodyType: 'Hourglass',
      fitRating: 'Perfect',
      review: 'Love this sweater! The medium fits perfectly - not too tight or loose. The knit is soft and the color is exactly as shown. Highly recommend!',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=150&h=200&fit=crop&crop=center',
      customerPhoto: 'https://randomuser.me/api/portraits/women/37.jpg',
      helpful: 19,
      verified: true,
      date: '2024-08-05'
    }
  ];

  const products = [...new Set(customerReviews.map(review => review.productName))];
  const sizes = [...new Set(customerReviews.map(review => review.size))];
  const fitRatings = [...new Set(customerReviews.map(review => review.fitRating))];

  const filteredReviews = customerReviews?.filter(review => {
    const productMatch = !selectedProduct || review?.productName === selectedProduct;
    const sizeMatch = filterSize === 'all' || review?.size === filterSize;
    const fitMatch = filterFit === 'all' || review?.fitRating === filterFit;
    return productMatch && sizeMatch && fitMatch;
  });

  const getFitRatingColor = (rating) => {
    switch (rating) {
      case 'Perfect':
        return 'text-success bg-success/10';
      case 'Slightly loose': case 'Slightly tight':
        return 'text-warning bg-warning/10';
      case 'Runs small': case 'Runs large':
        return 'text-error bg-error/10';
      default:
        return 'text-text-secondary bg-surface';
    }
  };

  const getFitIcon = (rating) => {
    switch (rating) {
      case 'Perfect':
        return 'CheckCircle';
      case 'Slightly loose':
        return 'ArrowUp';
      case 'Slightly tight':
        return 'ArrowDown';
      case 'Runs small':
        return 'Minus';
      case 'Runs large':
        return 'Plus';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-brand p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Customer Fit Feedback</h2>
          <p className="text-text-secondary">Real customers sharing how items fit with photos and details</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={20} className="text-secondary" />
          <span className="text-sm text-text-secondary">{filteredReviews?.length} reviews</span>
        </div>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Product Filter */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Filter by Product</label>
          <select
            value={selectedProduct || ''}
            onChange={(e) => setSelectedProduct(e?.target?.value || null)}
            className="w-full p-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Products</option>
            {products?.map((product) => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>

        {/* Size Filter */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Filter by Size</label>
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e?.target?.value)}
            className="w-full p-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Sizes</option>
            {sizes?.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Fit Filter */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Filter by Fit</label>
          <select
            value={filterFit}
            onChange={(e) => setFilterFit(e?.target?.value)}
            className="w-full p-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Fits</option>
            {fitRatings?.map((rating) => (
              <option key={rating} value={rating}>{rating}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews?.map((review) => (
          <div key={review?.id} className="border border-border rounded-lg p-6 hover:shadow-brand transition-brand">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={review?.image}
                  alt={review?.productName}
                  className="w-24 h-32 object-cover rounded-lg"
                />
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{review?.productName}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-2">
                        <img
                          src={review?.customerPhoto}
                          alt={review?.customerName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-text-secondary">{review?.customerName}</span>
                        {review?.verified && (
                          <Icon name="CheckCircle" size={14} className="text-success" />
                        )}
                      </div>
                      <span className="text-sm text-text-secondary">
                        {new Date(review.date)?.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getFitRatingColor(review?.fitRating)}`}>
                    <div className="flex items-center space-x-1">
                      <Icon name={getFitIcon(review?.fitRating)} size={14} />
                      <span>{review?.fitRating}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-surface rounded-lg">
                  <div>
                    <span className="text-xs text-text-secondary">Size Ordered</span>
                    <div className="font-medium text-text-primary">{review?.size}</div>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Height</span>
                    <div className="font-medium text-text-primary">{review?.height}</div>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Body Type</span>
                    <div className="font-medium text-text-primary">{review?.bodyType}</div>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary">Fit Rating</span>
                    <div className="font-medium text-text-primary">{review?.fitRating}</div>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-text-secondary mb-4">{review?.review}</p>

                {/* Helpful Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-sm text-text-secondary hover:text-text-primary transition-brand">
                      <Icon name="ThumbsUp" size={14} />
                      <span>Helpful ({review?.helpful})</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-text-secondary hover:text-text-primary transition-brand">
                      <Icon name="MessageCircle" size={14} />
                      <span>Reply</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-1 text-sm text-text-secondary hover:text-text-primary transition-brand">
                    <Icon name="Share2" size={14} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* No Results */}
      {filteredReviews?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No reviews found</h3>
          <p className="text-text-secondary">Try adjusting your filters to see more reviews.</p>
        </div>
      )}
      {/* Call to Action */}
      <div className="mt-8 p-6 bg-surface rounded-lg text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Share Your Fit Experience</h3>
        <p className="text-text-secondary mb-4">
          Help other customers by sharing how your recent purchases fit. Include photos and details to earn style points!
        </p>
        <Button iconName="Camera" iconPosition="left">
          Write a Fit Review
        </Button>
      </div>
    </div>
  );
};

export default CustomerFitFeedback;