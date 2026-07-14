"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FilterSidebar from './components/FilterSidebar';
import ProductCard from './components/ProductCard';
import SearchBar from './components/SearchBar';
import SortDropdown from './components/SortDropdown';
import QuickViewModal from './components/QuickViewModal';
import StyleItSection from './components/StyleItSection';
import StylistPicks from './components/StylistPicks';

const ProductCatalog = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSort, setCurrentSort] = useState('relevance');
  const [filters, setFilters] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showStyleIt, setShowStyleIt] = useState(false);

  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: 'Elegant Silk Blouse',
      brand: 'StyleHub',
      price: 89.99,
      originalPrice: 119.99,
      rating: 4.5,
      reviewCount: 128,
      images: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop'
      ],
      colors: [
        { name: 'Ivory', hex: '#F8F8FF' },
        { name: 'Navy', hex: '#1E3A8A' },
        { name: 'Blush', hex: '#FFC0CB' }
      ],
      availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
      isNew: true,
      isWishlisted: false,
      sustainabilityBadges: ['Organic']
    },
    {
      id: 2,
      name: 'High-Waisted Wide Leg Jeans',
      brand: 'Denim Dreams',
      price: 78.99,
      originalPrice: 95.99,
      rating: 4.7,
      reviewCount: 203,
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1506629905607-d9d36b10ddac?w=400&h=500&fit=crop'
      ],
      colors: [
        { name: 'Dark Wash', hex: '#2C3E50' },
        { name: 'Light Wash', hex: '#87CEEB' }
      ],
      availableSizes: ['24', '26', '28', '30', '32'],
      isNew: false,
      isWishlisted: true,
      sustainabilityBadges: ['Recycled']
    },
    {
      id: 3,
      name: 'Cashmere Blend Cardigan',
      brand: 'Cozy Luxe',
      price: 145.99,
      rating: 4.8,
      reviewCount: 89,
      images: [
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop'
      ],
      colors: [
        { name: 'Cream', hex: '#F5F5DC' },
        { name: 'Camel', hex: '#C19A6B' },
        { name: 'Black', hex: '#000000' }
      ],
      availableSizes: ['XS', 'S', 'M', 'L'],
      isNew: false,
      isWishlisted: false,
      sustainabilityBadges: ['Ethical']
    },
    {
      id: 4,
      name: 'Midi Wrap Dress',
      brand: 'Elegant Essentials',
      price: 125.99,
      rating: 4.6,
      reviewCount: 156,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop'
      ],
      colors: [
        { name: 'Floral Print', hex: '#FFB6C1' },
        { name: 'Solid Black', hex: '#000000' }
      ],
      availableSizes: ['S', 'M', 'L', 'XL'],
      isNew: true,
      isWishlisted: false,
      sustainabilityBadges: []
    },
    {
      id: 5,
      name: 'Leather Ankle Boots',
      brand: 'Urban Steps',
      price: 189.99,
      originalPrice: 229.99,
      rating: 4.4,
      reviewCount: 94,
      images: [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop'
      ],
      colors: [
        { name: 'Black', hex: '#000000' },
        { name: 'Brown', hex: '#8B4513' }
      ],
      availableSizes: ['6', '7', '8', '9', '10'],
      isNew: false,
      isWishlisted: true,
      sustainabilityBadges: ['Local']
    },
    {
      id: 6,
      name: 'Structured Blazer',
      brand: 'Professional Plus',
      price: 159.99,
      rating: 4.9,
      reviewCount: 67,
      images: [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'
      ],
      colors: [
        { name: 'Navy', hex: '#1E3A8A' },
        { name: 'Charcoal', hex: '#36454F' }
      ],
      availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
      isNew: false,
      isWishlisted: false,
      sustainabilityBadges: ['Organic', 'Ethical']
    }
  ];

  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [totalResults, setTotalResults] = useState(mockProducts?.length);

  const productsPerPage = 12;
  const totalPages = Math.ceil(totalResults / productsPerPage);

  useEffect(() => {
    // Filter and sort products based on current state
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered?.filter(product =>
        product?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        product?.brand?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Apply category filters
    Object.entries(filters)?.forEach(([category, values]) => {
      if (values && values?.length > 0) {
        // This is a simplified filter logic - in a real app, you'd have more sophisticated filtering
        filtered = filtered?.filter(product => {
          switch (category) {
            case 'price':
              return values?.some(range => {
                const [min, max] = range?.split('-')?.map(Number);
                return max ? product?.price >= min && product?.price <= max : product?.price >= min;
              });
            case 'size':
              return values?.some(size => product?.availableSizes?.includes(size?.toUpperCase()));
            case 'color':
              return values?.some(color => 
                product?.colors?.some(c => c?.name?.toLowerCase()?.includes(color))
              );
            default:
              return true;
          }
        });
      }
    });

    // Apply sorting
    switch (currentSort) {
      case 'price-low':
        filtered?.sort((a, b) => a?.price - b?.price);
        break;
      case 'price-high':
        filtered?.sort((a, b) => b?.price - a?.price);
        break;
      case 'rating':
        filtered?.sort((a, b) => b?.rating - a?.rating);
        break;
      case 'newest':
        filtered?.sort((a, b) => b?.isNew - a?.isNew);
        break;
      case 'most-loved':
        filtered?.sort((a, b) => b?.reviewCount - a?.reviewCount);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    setFilteredProducts(filtered);
    setTotalResults(filtered?.length);
    setCurrentPage(1);
  }, [searchQuery, filters, currentSort, products]);

  const handleFilterChange = (category, values) => {
    setFilters(prev => ({
      ...prev,
      [category]: values
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleWishlistToggle = (productId) => {
    setProducts(prev => prev?.map(product =>
      product?.id === productId
        ? { ...product, isWishlisted: !product?.isWishlisted }
        : product
    ));
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (productData) => {
    console.log('Adding to cart:', productData);
    // Handle add to cart logic
  };

  const handleVoiceSearch = () => {
    // Simulate voice search result
    setSearchQuery('summer dress');
  };

  const handleVisualSearch = (file) => {
    console.log('Visual search with file:', file);
    // Handle visual search logic
    setSearchQuery('floral pattern');
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowStyleIt(!!product);
  };

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts?.slice(startIndex, endIndex);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-surface to-accent/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Discover Your Style
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Explore our curated collection of contemporary fashion pieces designed to express your unique personality
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onVoiceSearch={handleVoiceSearch}
                onVisualSearch={handleVisualSearch}
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Filter Sidebar */}
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAllFilters}
            />

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {/* Mobile Filter Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden"
                    iconName="Filter"
                    iconPosition="left"
                  >
                    Filters
                  </Button>

                  {/* Results Count */}
                  <div className="text-text-secondary">
                    <span className="font-medium text-primary">{totalResults}</span> results
                    {searchQuery && (
                      <span> for "{searchQuery}"</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="hidden md:flex items-center space-x-1 bg-surface rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${
                        viewMode === 'grid' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-primary'
                      }`}
                    >
                      <Icon name="Grid3X3" size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${
                        viewMode === 'list' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-primary'
                      }`}
                    >
                      <Icon name="List" size={16} />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <SortDropdown
                    currentSort={currentSort}
                    onSortChange={setCurrentSort}
                  />

                  {/* Style It Toggle */}
                  <Button
                    variant={showStyleIt ? "default" : "outline"}
                    onClick={() => setShowStyleIt(!showStyleIt)}
                    iconName="Sparkles"
                    iconPosition="left"
                    className="hidden lg:flex"
                  >
                    Style It
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {Object.entries(filters)?.some(([_, values]) => values && values?.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-text-secondary">Active filters:</span>
                  {Object.entries(filters)?.map(([category, values]) =>
                    values && values?.length > 0 ? values?.map((value) => (
                      <span
                        key={`${category}-${value}`}
                        className="inline-flex items-center space-x-1 bg-accent text-accent-foreground text-sm px-3 py-1 rounded-full"
                      >
                        <span>{value}</span>
                        <button
                          onClick={() => {
                            const newValues = values?.filter(v => v !== value);
                            handleFilterChange(category, newValues);
                          }}
                          className="hover:text-primary"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </span>
                    )) : null
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-text-secondary hover:text-primary"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Products Grid */}
              {filteredProducts?.length > 0 ? (
                <div className={`grid gap-6 mb-8 ${
                  viewMode === 'grid' ?'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :'grid-cols-1'
                }`}>
                  {getCurrentPageProducts()?.map((product) => (
                    <ProductCard
                      key={product?.id}
                      product={product}
                      onWishlistToggle={handleWishlistToggle}
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary mb-2">No products found</h3>
                  <p className="text-text-secondary mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button variant="outline" onClick={handleClearAllFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mb-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </Button>
                  
                  {[...Array(Math.min(5, totalPages))]?.map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                </div>
              )}

              {/* Stylist Picks Section */}
              <StylistPicks onProductClick={handleProductSelect} />
            </div>

            {/* Style It Sidebar */}
            {showStyleIt && (
              <div className="hidden lg:block w-80">
                <div className="sticky top-24">
                  <StyleItSection
                    selectedProduct={selectedProduct}
                    onProductSelect={handleProductSelect}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        onWishlistToggle={handleWishlistToggle}
      />
    </div>
  );
};

export default ProductCatalog;