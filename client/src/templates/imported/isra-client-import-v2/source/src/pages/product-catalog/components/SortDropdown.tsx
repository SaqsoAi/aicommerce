"use client";

import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SortDropdown = ({ currentSort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant', icon: 'Target' },
    { value: 'trending', label: 'Trending Now', icon: 'TrendingUp' },
    { value: 'most-loved', label: 'Most Loved', icon: 'Heart' },
    { value: 'perfect-for-you', label: 'Perfect for You', icon: 'Sparkles' },
    { value: 'newest', label: 'Newest First', icon: 'Clock' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'ArrowUp' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'ArrowDown' },
    { value: 'rating', label: 'Highest Rated', icon: 'Star' },
    { value: 'discount', label: 'Biggest Discount', icon: 'Percent' }
  ];

  const currentSortOption = sortOptions?.find(option => option?.value === currentSort) || sortOptions?.[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortSelect = (sortValue) => {
    onSortChange(sortValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[180px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Icon name={currentSortOption?.icon} size={16} />
          <span className="hidden sm:inline">{currentSortOption?.label}</span>
          <span className="sm:hidden">Sort</span>
        </div>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-text-secondary"
        />
      </Button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-brand-lg z-50 py-2">
          <div className="px-3 py-2 text-sm font-medium text-text-secondary border-b border-border">
            Sort by
          </div>
          
          {sortOptions?.map((option) => (
            <button
              key={option?.value}
              onClick={() => handleSortSelect(option?.value)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-surface transition-colors duration-200 ${
                currentSort === option?.value ? 'bg-surface text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon 
                name={option?.icon} 
                size={16} 
                className={currentSort === option?.value ? 'text-primary' : 'text-text-secondary'}
              />
              <span className="flex-1">{option?.label}</span>
              {currentSort === option?.value && (
                <Icon name="Check" size={16} className="text-primary" />
              )}
            </button>
          ))}

          {/* AI Recommendation Notice */}
          <div className="border-t border-border mt-2 pt-2 px-3 py-2">
            <div className="flex items-start space-x-2">
              <Icon name="Sparkles" size={14} className="text-secondary mt-0.5" />
              <div className="text-xs text-text-secondary">
                <span className="font-medium text-secondary">"Perfect for You"</span> uses AI to personalize results based on your style preferences and browsing history.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;