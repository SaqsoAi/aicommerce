"use client";

import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const StyleDiscovery = () => {
  const [activeTab, setActiveTab] = useState('outfit-builder');
  const [selectedOutfitPieces, setSelectedOutfitPieces] = useState({
    top: null,
    bottom: null,
    shoes: null,
    accessories: null
  });

  const outfitPieces = {
    tops: [
      {
        id: 1,
        name: 'Silk Blouse',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=250&fit=crop',
        price: 89.99,
        color: 'Ivory'
      },
      {
        id: 2,
        name: 'Cashmere Sweater',
        image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=200&h=250&fit=crop',
        price: 129.99,
        color: 'Camel'
      },
      {
        id: 3,
        name: 'Cotton Tee',
        image: 'https://images.pixabay.com/photo/2016/12/06/09/31/woman-1886838_1280.jpg?w=200&h=250&fit=crop',
        price: 29.99,
        color: 'White'
      }
    ],
    bottoms: [
      {
        id: 4,
        name: 'High-Waist Trousers',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=250&fit=crop',
        price: 99.99,
        color: 'Black'
      },
      {
        id: 5,
        name: 'Midi Skirt',
        image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=200&h=250&fit=crop',
        price: 69.99,
        color: 'Navy'
      },
      {
        id: 6,
        name: 'Denim Jeans',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=250&fit=crop',
        price: 79.99,
        color: 'Blue'
      }
    ],
    shoes: [
      {
        id: 7,
        name: 'Leather Loafers',
        image: 'https://images.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg?w=200&h=250&fit=crop',
        price: 149.99,
        color: 'Brown'
      },
      {
        id: 8,
        name: 'Block Heels',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=250&fit=crop',
        price: 119.99,
        color: 'Black'
      }
    ],
    accessories: [
      {
        id: 9,
        name: 'Leather Handbag',
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?w=200&h=250&fit=crop',
        price: 199.99,
        color: 'Tan'
      },
      {
        id: 10,
        name: 'Statement Necklace',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=250&fit=crop',
        price: 59.99,
        color: 'Gold'
      }
    ]
  };

  const visualSearchSuggestions = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop',
      title: 'Street Style Inspiration',
      matches: '12 similar items found'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=300&h=400&fit=crop',
      title: 'Office Chic Look',
      matches: '8 similar items found'
    },
    {
      id: 3,
      image: 'https://images.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg?w=300&h=400&fit=crop',
      title: 'Weekend Casual',
      matches: '15 similar items found'
    }
  ];

  const handlePieceSelect = (category, piece) => {
    setSelectedOutfitPieces(prev => ({
      ...prev,
      [category]: piece
    }));
  };

  const handleCompleteOutfit = () => {
    window.location.href = '/shopping-cart-checkout';
  };

  const handleVisualSearch = () => {
    // Visual search functionality would be implemented here
    console.log('Visual search activated');
  };

  const calculateOutfitTotal = () => {
    return Object.values(selectedOutfitPieces)?.filter(piece => piece !== null)?.reduce((total, piece) => total + piece?.price, 0);
  };

  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Style Discovery Tools
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Create perfect outfits and find exactly what you're looking for with our innovative discovery tools
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-card rounded-lg p-1 shadow-brand">
            <button
              onClick={() => setActiveTab('outfit-builder')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'outfit-builder' ?'bg-primary text-primary-foreground shadow-sm' :'text-text-secondary hover:text-primary'
              }`}
            >
              <Icon name="Shirt" size={16} className="inline mr-2" />
              Outfit Builder
            </button>
            <button
              onClick={() => setActiveTab('visual-search')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'visual-search' ?'bg-primary text-primary-foreground shadow-sm' :'text-text-secondary hover:text-primary'
              }`}
            >
              <Icon name="Camera" size={16} className="inline mr-2" />
              Visual Search
            </button>
          </div>
        </div>

        {/* Outfit Builder Tab */}
        {activeTab === 'outfit-builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Outfit Categories */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tops */}
                <div className="bg-card rounded-lg p-6 shadow-brand">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <Icon name="Shirt" size={20} className="mr-2" />
                    Tops
                  </h3>
                  <div className="space-y-3">
                    {outfitPieces?.tops?.map((piece) => (
                      <div
                        key={piece?.id}
                        onClick={() => handlePieceSelect('top', piece)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedOutfitPieces?.top?.id === piece?.id
                            ? 'bg-secondary/10 border-2 border-secondary' :'hover:bg-surface border-2 border-transparent'
                        }`}
                      >
                        <Image
                          src={piece?.image}
                          alt={piece?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-primary text-sm">{piece?.name}</p>
                          <p className="text-text-secondary text-xs">{piece?.color}</p>
                        </div>
                        <span className="font-semibold text-primary text-sm">${piece?.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottoms */}
                <div className="bg-card rounded-lg p-6 shadow-brand">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <Icon name="Zap" size={20} className="mr-2" />
                    Bottoms
                  </h3>
                  <div className="space-y-3">
                    {outfitPieces?.bottoms?.map((piece) => (
                      <div
                        key={piece?.id}
                        onClick={() => handlePieceSelect('bottom', piece)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedOutfitPieces?.bottom?.id === piece?.id
                            ? 'bg-secondary/10 border-2 border-secondary' :'hover:bg-surface border-2 border-transparent'
                        }`}
                      >
                        <Image
                          src={piece?.image}
                          alt={piece?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-primary text-sm">{piece?.name}</p>
                          <p className="text-text-secondary text-xs">{piece?.color}</p>
                        </div>
                        <span className="font-semibold text-primary text-sm">${piece?.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shoes */}
                <div className="bg-card rounded-lg p-6 shadow-brand">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <Icon name="Footprints" size={20} className="mr-2" />
                    Shoes
                  </h3>
                  <div className="space-y-3">
                    {outfitPieces?.shoes?.map((piece) => (
                      <div
                        key={piece?.id}
                        onClick={() => handlePieceSelect('shoes', piece)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedOutfitPieces?.shoes?.id === piece?.id
                            ? 'bg-secondary/10 border-2 border-secondary' :'hover:bg-surface border-2 border-transparent'
                        }`}
                      >
                        <Image
                          src={piece?.image}
                          alt={piece?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-primary text-sm">{piece?.name}</p>
                          <p className="text-text-secondary text-xs">{piece?.color}</p>
                        </div>
                        <span className="font-semibold text-primary text-sm">${piece?.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessories */}
                <div className="bg-card rounded-lg p-6 shadow-brand">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <Icon name="Watch" size={20} className="mr-2" />
                    Accessories
                  </h3>
                  <div className="space-y-3">
                    {outfitPieces?.accessories?.map((piece) => (
                      <div
                        key={piece?.id}
                        onClick={() => handlePieceSelect('accessories', piece)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedOutfitPieces?.accessories?.id === piece?.id
                            ? 'bg-secondary/10 border-2 border-secondary' :'hover:bg-surface border-2 border-transparent'
                        }`}
                      >
                        <Image
                          src={piece?.image}
                          alt={piece?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-primary text-sm">{piece?.name}</p>
                          <p className="text-text-secondary text-xs">{piece?.color}</p>
                        </div>
                        <span className="font-semibold text-primary text-sm">${piece?.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Outfit Summary */}
            <div className="bg-card rounded-lg p-6 shadow-brand h-fit sticky top-8">
              <h3 className="text-lg font-semibold text-primary mb-4">Your Outfit</h3>
              
              <div className="space-y-4 mb-6">
                {Object.entries(selectedOutfitPieces)?.map(([category, piece]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary capitalize">{category}:</span>
                    {piece ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-primary">{piece?.name}</span>
                        <span className="text-sm text-text-secondary">${piece?.price}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-text-secondary">Not selected</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">Total:</span>
                  <span className="font-bold text-lg text-primary">${calculateOutfitTotal()?.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="default"
                  fullWidth
                  onClick={handleCompleteOutfit}
                  disabled={Object.values(selectedOutfitPieces)?.every(piece => piece === null)}
                  iconName="ShoppingBag"
                  iconPosition="left"
                >
                  Add Outfit to Cart
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  iconName="Heart"
                  iconPosition="left"
                >
                  Save Outfit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Visual Search Tab */}
        {activeTab === 'visual-search' && (
          <div className="max-w-4xl mx-auto">
            {/* Upload Area */}
            <div className="bg-card rounded-lg p-8 shadow-brand mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Camera" size={32} className="text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Find Similar Styles</h3>
                <p className="text-text-secondary mb-6">
                  Upload a photo or take a picture to find similar items in our catalog
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="default"
                    onClick={handleVisualSearch}
                    iconName="Upload"
                    iconPosition="left"
                  >
                    Upload Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleVisualSearch}
                    iconName="Camera"
                    iconPosition="left"
                  >
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Visual Search Suggestions */}
            <div>
              <h3 className="text-xl font-semibold text-primary mb-6">Popular Visual Searches</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visualSearchSuggestions?.map((suggestion) => (
                  <div
                    key={suggestion?.id}
                    className="bg-card rounded-lg overflow-hidden shadow-brand hover:shadow-brand-lg transition-all duration-300 cursor-pointer hover-lift"
                    onClick={handleVisualSearch}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={suggestion?.image}
                        alt={suggestion?.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-medium mb-1">{suggestion?.title}</h4>
                        <p className="text-white/80 text-sm">{suggestion?.matches}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StyleDiscovery;