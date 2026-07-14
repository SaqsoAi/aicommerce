"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductInfo = ({ product, onAddToCart, onAddToWishlist }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onAddToCart({ ...product, selectedSize, quantity });
  };

  return (
    <div className="space-y-6">
      {/* Product Title and Price */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl lg:text-3xl font-semibold text-primary">{product?.name}</h1>
          <button
            onClick={() => onAddToWishlist(product)}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <Icon name="Heart" size={24} className="text-text-secondary hover:text-cta" />
          </button>
        </div>
        <p className="text-text-secondary mb-3">{product?.brand}</p>
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-semibold text-primary">${product?.price}</span>
          {product?.originalPrice && (
            <span className="text-lg text-text-secondary line-through">${product?.originalPrice}</span>
          )}
          {product?.discount && (
            <span className="bg-cta text-cta-foreground px-2 py-1 rounded text-sm font-medium">
              {product?.discount}% OFF
            </span>
          )}
        </div>
      </div>
      {/* Product Description */}
      <div>
        <p className="text-text-secondary leading-relaxed">{product?.description}</p>
      </div>
      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-primary">Size</h3>
          <button className="text-sm text-secondary hover:text-secondary/80 flex items-center space-x-1">
            <Icon name="Ruler" size={16} />
            <span>Size Guide</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product?.sizes?.map((size) => (
            <button
              key={size?.value}
              onClick={() => handleSizeSelect(size?.value)}
              disabled={!size?.available}
              className={`p-3 border rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedSize === size?.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : size?.available
                  ? 'border-border hover:border-secondary' :'border-border bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {size?.label}
            </button>
          ))}
        </div>
      </div>
      {/* Quantity Selection */}
      <div>
        <h3 className="font-medium text-primary mb-3">Quantity</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-10 h-10 border border-border rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
          >
            <Icon name="Minus" size={16} />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-10 h-10 border border-border rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
          >
            <Icon name="Plus" size={16} />
          </button>
        </div>
      </div>
      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${product?.inStock ? 'bg-success' : 'bg-error'}`} />
        <span className={`text-sm ${product?.inStock ? 'text-success' : 'text-error'}`}>
          {product?.inStock ? `${product?.stockCount} in stock` : 'Out of stock'}
        </span>
      </div>
      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={handleAddToCart}
          disabled={!product?.inStock}
          className="h-12"
        >
          {product?.inStock ? 'Add to Cart' : 'Notify When Available'}
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" fullWidth>
            <Icon name="MessageCircle" size={18} className="mr-2" />
            Ask Stylist
          </Button>
          <Button variant="outline" size="lg" fullWidth>
            <Icon name="Share2" size={18} className="mr-2" />
            Share
          </Button>
        </div>
      </div>
      {/* Shipping Info */}
      <div className="bg-surface p-4 rounded-lg space-y-3">
        <div className="flex items-center space-x-3">
          <Icon name="Truck" size={20} className="text-success" />
          <div>
            <p className="font-medium text-primary">Free Shipping</p>
            <p className="text-sm text-text-secondary">On orders over $75</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon name="RotateCcw" size={20} className="text-secondary" />
          <div>
            <p className="font-medium text-primary">Easy Returns</p>
            <p className="text-sm text-text-secondary">30-day return policy</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Icon name="Shield" size={20} className="text-accent" />
          <div>
            <p className="font-medium text-primary">Secure Payment</p>
            <p className="text-sm text-text-secondary">SSL encrypted checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;