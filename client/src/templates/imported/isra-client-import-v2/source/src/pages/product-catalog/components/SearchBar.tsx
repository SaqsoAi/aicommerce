"use client";

import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SearchBar = ({ searchQuery, onSearchChange, onVoiceSearch, onVisualSearch }) => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef(null);

  const mockSuggestions = [
    { type: 'product', text: 'Black leather jacket', category: 'Outerwear' },
    { type: 'product', text: 'Floral summer dress', category: 'Dresses' },
    { type: 'brand', text: 'Zara', category: 'Brand' },
    { type: 'category', text: 'Work to Weekend', category: 'Occasion' },
    { type: 'trend', text: 'Minimalist style', category: 'Trending' },
    { type: 'product', text: 'High-waisted jeans', category: 'Bottoms' }
  ];

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    onSearchChange(value);
    
    if (value?.length > 0) {
      const filtered = mockSuggestions?.filter(suggestion =>
        suggestion?.text?.toLowerCase()?.includes(value?.toLowerCase())
      );
      setSuggestions(filtered?.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion?.text);
    setShowSuggestions(false);
  };

  const handleVoiceSearch = () => {
    setIsVoiceActive(true);
    // Simulate voice search
    setTimeout(() => {
      setIsVoiceActive(false);
      onVoiceSearch();
    }, 2000);
  };

  const handleVisualSearch = () => {
    fileInputRef?.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      onVisualSearch(file);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'product': return 'Package';
      case 'brand': return 'Tag';
      case 'category': return 'Grid3X3';
      case 'trend': return 'TrendingUp';
      default: return 'Search';
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon name="Search" size={20} className="text-text-secondary" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery?.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search for styles, brands, or trends..."
          className="w-full pl-12 pr-24 py-3 bg-surface border border-border rounded-xl text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
        />

        {/* Action Buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
          {/* Voice Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceSearch}
            className={`w-8 h-8 ${isVoiceActive ? 'text-cta animate-pulse' : 'text-text-secondary hover:text-primary'}`}
            title="Voice Search"
          >
            <Icon name="Mic" size={16} />
          </Button>

          {/* Visual Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVisualSearch}
            className="w-8 h-8 text-text-secondary hover:text-primary"
            title="Visual Search"
          >
            <Icon name="Camera" size={16} />
          </Button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      {/* Voice Search Indicator */}
      {isVoiceActive && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-card border border-border rounded-lg shadow-brand-lg z-50">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-cta rounded-full animate-pulse"></div>
            <span className="text-sm text-primary">Listening...</span>
            <div className="flex space-x-1">
              {[...Array(3)]?.map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-cta rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Search Suggestions */}
      {showSuggestions && suggestions?.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-brand-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-text-secondary">
              <span>Suggestions</span>
              <span>{suggestions?.length} results</span>
            </div>
            
            {suggestions?.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-surface rounded-lg transition-colors duration-200"
              >
                <Icon 
                  name={getSuggestionIcon(suggestion?.type)} 
                  size={16} 
                  className="text-text-secondary" 
                />
                <div className="flex-1">
                  <span className="text-primary">{suggestion?.text}</span>
                  <span className="text-sm text-text-secondary ml-2">
                    in {suggestion?.category}
                  </span>
                </div>
                <Icon name="ArrowUpRight" size={14} className="text-text-secondary" />
              </button>
            ))}
          </div>

          {/* Popular Searches */}
          <div className="border-t border-border p-2">
            <div className="px-3 py-2 text-sm text-text-secondary">Popular Searches</div>
            <div className="flex flex-wrap gap-2 px-3 pb-2">
              {['Summer dresses', 'Work blazers', 'Casual sneakers', 'Sustainable fashion']?.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSuggestionClick({ text: term })}
                  className="px-3 py-1 bg-surface text-sm text-primary rounded-full hover:bg-accent transition-colors duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;