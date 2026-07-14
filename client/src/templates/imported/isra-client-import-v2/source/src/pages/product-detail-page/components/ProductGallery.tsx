"use client";

import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ProductGallery = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const images = [
    product?.mainImage,
    ...product?.additionalImages
  ];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images?.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images?.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative bg-surface rounded-lg overflow-hidden group">
        <div className="aspect-square relative">
          <Image
            src={images?.[currentImageIndex]}
            alt={`${product?.name} - View ${currentImageIndex + 1}`}
            className={`w-full h-full object-cover cursor-zoom-in transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            onClick={toggleZoom}
          />
          
          {/* Navigation Arrows */}
          {images?.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images?.length}
          </div>

          {/* Zoom Indicator */}
          {isZoomed && (
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center space-x-1">
              <Icon name="ZoomIn" size={16} />
              <span>Click to zoom out</span>
            </div>
          )}
        </div>
      </div>
      {/* Thumbnail Gallery */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images?.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              index === currentImageIndex
                ? 'border-primary shadow-md'
                : 'border-border hover:border-secondary'
            }`}
          >
            <Image
              src={image}
              alt={`${product?.name} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      {/* AR Try-On Button */}
      <div className="flex justify-center pt-2">
        <button className="flex items-center space-x-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors">
          <Icon name="Camera" size={18} />
          <span className="text-sm font-medium">Try with AR</span>
        </button>
      </div>
    </div>
  );
};

export default ProductGallery;