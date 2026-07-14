"use client";

import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CartItem = ({ item, onUpdateQuantity, onRemove, onMoveToWishlist }) => {
  const [quantity, setQuantity] = useState(item?.quantity);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    onUpdateQuantity(item?.id, newQuantity);
  };

  const handleRemove = () => {
    onRemove(item?.id);
  };

  const handleMoveToWishlist = () => {
    onMoveToWishlist(item?.id);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card border border-border rounded-lg">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-surface rounded-lg overflow-hidden">
          <Image
            src={item?.image}
            alt={item?.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-medium text-text-primary line-clamp-2">
              {item?.name}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {item?.brand}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
              <span>Size: {item?.size}</span>
              <span>Color: {item?.color}</span>
            </div>
            {item?.lowStock && (
              <div className="flex items-center gap-1 mt-2">
                <Icon name="AlertTriangle" size={14} className="text-warning" />
                <span className="text-xs text-warning">Only {item?.stockCount} left</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-semibold text-text-primary">
              ${(item?.price * quantity)?.toFixed(2)}
            </div>
            <div className="text-sm text-text-secondary">
              ${item?.price?.toFixed(2)} each
            </div>
            {item?.originalPrice && item?.originalPrice > item?.price && (
              <div className="text-xs text-text-secondary line-through">
                ${item?.originalPrice?.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Quantity and Actions */}
        <div className="flex items-center justify-between mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Qty:</span>
            <div className="flex items-center border border-border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Icon name="Minus" size={14} />
              </Button>
              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Icon name="Plus" size={14} />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveToWishlist}
              className="text-text-secondary hover:text-primary"
            >
              <Icon name="Heart" size={14} className="mr-1" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-text-secondary hover:text-destructive"
            >
              <Icon name="Trash2" size={14} className="mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;