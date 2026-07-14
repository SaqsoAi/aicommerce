"use client";

import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerReviews = ({ reviews, averageRating, totalReviews }) => {
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filterOptions = [
    { value: 'all', label: 'All Reviews' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: 'photos', label: 'With Photos' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' }
  ];

  const filteredReviews = reviews?.filter(review => {
    if (filterBy === 'all') return true;
    if (filterBy === 'photos') return review?.photos && review?.photos?.length > 0;
    return review?.rating?.toString() === filterBy;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={16}
        className={index < rating ? 'text-warning fill-current' : 'text-border'}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Customer Reviews</h2>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-lg font-medium text-primary">{averageRating}</span>
            <span className="text-text-secondary">({totalReviews} reviews)</span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="Edit3" size={16} className="mr-2" />
          Write Review
        </Button>
      </div>
      {/* Rating Breakdown */}
      <div className="bg-surface p-4 rounded-lg">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1]?.map((rating) => {
            const count = reviews?.filter(r => r?.rating === rating)?.length;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm text-text-secondary w-8">{rating}</span>
                <Icon name="Star" size={14} className="text-warning fill-current" />
                <div className="flex-1 bg-border rounded-full h-2">
                  <div
                    className="bg-warning h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Filter:</span>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {filterOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {sortOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews?.map((review) => (
          <div key={review?.id} className="border-b border-border pb-6 last:border-b-0">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">
                  {review?.customerName?.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-primary">{review?.customerName}</span>
                      {review?.verified && (
                        <span className="bg-success/20 text-success px-2 py-0.5 rounded text-xs font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {renderStars(review?.rating)}
                      </div>
                      <span className="text-sm text-text-secondary">
                        {formatDate(review?.date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary">
                    Size: {review?.size}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-primary mb-1">{review?.title}</h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {review?.comment}
                  </p>
                </div>

                {/* Review Photos */}
                {review?.photos && review?.photos?.length > 0 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {review?.photos?.map((photo, index) => (
                      <div key={index} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Helpful Actions */}
                <div className="flex items-center space-x-4 pt-2">
                  <button className="flex items-center space-x-1 text-sm text-text-secondary hover:text-primary transition-colors">
                    <Icon name="ThumbsUp" size={14} />
                    <span>Helpful ({review?.helpfulCount})</span>
                  </button>
                  <button className="text-sm text-text-secondary hover:text-primary transition-colors">
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Load More Button */}
      {filteredReviews?.length < totalReviews && (
        <div className="text-center">
          <Button variant="outline">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;