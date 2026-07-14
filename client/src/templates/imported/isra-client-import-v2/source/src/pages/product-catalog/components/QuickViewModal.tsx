"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const QuickViewModal = ({ product, isOpen, onClose, onAddToCart, onWishlistToggle }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(price);
  };

  const getDiscountPercentage = () => {
    if (product?.originalPrice && product?.price < product?.originalPrice) {
      return Math.round(((product?.originalPrice - product?.price) / product?.originalPrice) * 100);
    }
    return 0;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
    onClose();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product?.images?.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product?.images?.length - 1 : prev - 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Quick View</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-surface rounded-lg overflow-hidden">
              <Image
                src={product?.images?.[currentImageIndex]}
                alt={product?.name}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {product?.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200"
                  >
                    <Icon name="ChevronLeft" size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200"
                  >
                    <Icon name="ChevronRight" size={16} className="text-primary" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col space-y-1">
                {product?.isNew && (
                  <span className="bg-cta text-cta-foreground text-xs font-medium px-2 py-1 rounded">
                    New
                  </span>
                )}
                {getDiscountPercentage() > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
                    -{getDiscountPercentage()}%
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product?.images?.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product?.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-primary' :'border-border hover:border-text-secondary'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product?.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-2">
              <p className="text-sm text-text-secondary font-medium">{product?.brand}</p>
              <h1 className="text-2xl font-semibold text-primary">{product?.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={14}
                      className={`${
                        i < Math.floor(product?.rating) 
                          ? 'text-warning fill-current' :'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-text-secondary">
                  {product?.rating} ({product?.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product?.price)}
                </span>
                {product?.originalPrice && product?.originalPrice > product?.price && (
                  <span className="text-lg text-text-secondary line-through">
                    {formatPrice(product?.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {product?.colors && product?.colors?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-primary">
                  Color: {selectedColor?.name}
                </h3>
                <div className="flex space-x-2">
                  {product?.colors?.map((color) => (
                    <button
                      key={color?.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        selectedColor?.name === color?.name 
                          ? 'border-primary scale-110' :'border-border hover:border-text-secondary'
                      }`}
                      style={{ backgroundColor: color?.hex }}
                      title={color?.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-primary">Size</h3>
                <button className="text-sm text-secondary hover:underline">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product?.availableSizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 border rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-primary hover:border-text-secondary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-medium text-primary">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:bg-surface transition-colors duration-200"
                >
                  <Icon name="Minus" size={14} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:bg-surface transition-colors duration-200"
                >
                  <Icon name="Plus" size={14} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                variant="default" 
                fullWidth 
                onClick={handleAddToCart}
                disabled={!selectedSize}
              >
                Add to Cart - {formatPrice(product?.price * quantity)}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => onWishlistToggle(product?.id)}
                  iconName={product?.isWishlisted ? "Heart" : "Heart"}
                  iconPosition="left"
                >
                  {product?.isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </Button>
                
                <Button 
                  variant="outline"
                  iconName="Share"
                  iconPosition="left"
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center space-x-3 text-sm">
                <Icon name="Truck" size={16} className="text-success" />
                <span className="text-text-secondary">Free shipping on orders over $75</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Icon name="RotateCcw" size={16} className="text-success" />
                <span className="text-text-secondary">Free returns within 30 days</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Icon name="Shield" size={16} className="text-success" />
                <span className="text-text-secondary">Secure checkout guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;