"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onWishlistToggle, onQuickView }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleProductClick = () => {
    router.push('/product-detail-page', { state: { product } });
  };

  const handleWishlistClick = (e) => {
    e?.stopPropagation();
    onWishlistToggle(product?.id);
  };

  const handleQuickViewClick = (e) => {
    e?.stopPropagation();
    onQuickView(product);
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === product?.images?.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? product?.images?.length - 1 : prev - 1
    );
  };

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

  return (
    <div 
      className="group bg-card rounded-lg overflow-hidden shadow-brand hover:shadow-brand-lg transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <Image
          src={product?.images?.[currentImageIndex]}
          alt={product?.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Image Navigation */}
        {product?.images?.length > 1 && isHovered && (
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

        {/* Image Indicators */}
        {product?.images?.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {product?.images?.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
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
          {product?.sustainabilityBadges?.map((badge) => (
            <span 
              key={badge}
              className="bg-success text-success-foreground text-xs font-medium px-2 py-1 rounded"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          <button
            onClick={handleWishlistClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              product?.isWishlisted 
                ? 'bg-destructive text-destructive-foreground' 
                : 'bg-white/90 text-text-secondary hover:bg-white hover:text-destructive'
            }`}
          >
            <Icon 
              name={product?.isWishlisted ? "Heart" : "Heart"} 
              size={16} 
              className={product?.isWishlisted ? "fill-current" : ""}
            />
          </button>
          
          {isHovered && (
            <button
              onClick={handleQuickViewClick}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all duration-200"
            >
              <Icon name="Eye" size={16} className="text-primary" />
            </button>
          )}
        </div>

        {/* Size Availability Indicator */}
        <div className="absolute bottom-2 right-2">
          <div className="flex space-x-1">
            {product?.availableSizes?.slice(0, 4)?.map((size) => (
              <span 
                key={size}
                className="bg-white/90 text-primary text-xs font-medium px-1.5 py-0.5 rounded"
              >
                {size}
              </span>
            ))}
            {product?.availableSizes?.length > 4 && (
              <span className="bg-white/90 text-primary text-xs font-medium px-1.5 py-0.5 rounded">
                +{product?.availableSizes?.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Product Info */}
      <div className="p-4 space-y-2">
        {/* Brand */}
        <p className="text-sm text-text-secondary font-medium">{product?.brand}</p>

        {/* Name */}
        <h3 className="font-medium text-primary line-clamp-2 group-hover:text-secondary transition-colors duration-200">
          {product?.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {[...Array(5)]?.map((_, i) => (
              <Icon
                key={i}
                name="Star"
                size={12}
                className={`${
                  i < Math.floor(product?.rating) 
                    ? 'text-warning fill-current' :'text-border'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-text-secondary">
            {product?.rating} ({product?.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-primary">
            {formatPrice(product?.price)}
          </span>
          {product?.originalPrice && product?.originalPrice > product?.price && (
            <span className="text-sm text-text-secondary line-through">
              {formatPrice(product?.originalPrice)}
            </span>
          )}
        </div>

        {/* Colors Available */}
        {product?.colors && product?.colors?.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Colors:</span>
            <div className="flex space-x-1">
              {product?.colors?.slice(0, 4)?.map((color) => (
                <div
                  key={color?.name}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color?.hex }}
                  title={color?.name}
                />
              ))}
              {product?.colors?.length > 4 && (
                <span className="text-xs text-text-secondary">
                  +{product?.colors?.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Quick Add to Cart (appears on hover) */}
      {isHovered && (
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <Button 
            variant="outline" 
            size="sm" 
            fullWidth
            onClick={(e) => {
              e?.stopPropagation();
              // Handle quick add to cart
            }}
          >
            Quick Add
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;