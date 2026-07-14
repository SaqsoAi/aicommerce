"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VirtualFittingSection = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);

  const arEnabledProducts = [
    {
      id: 1,
      name: 'Classic White Button Shirt',
      brand: 'StyleHub',
      price: '$89',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop&crop=center',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      arSupported: true
    },
    {
      id: 2,
      name: 'Floral Summer Dress',
      brand: 'StyleHub',
      price: '$129',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop&crop=center',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      arSupported: true
    },
    {
      id: 3,
      name: 'Denim Jacket',
      brand: 'StyleHub',
      price: '$149',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop&crop=center',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      arSupported: true
    },
    {
      id: 4,
      name: 'Knit Sweater',
      brand: 'StyleHub',
      price: '$99',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=400&fit=crop&crop=center',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      arSupported: true
    }
  ];

  const handleTryOn = async (product) => {
    setSelectedProduct(product);
    
    // Mock camera permission request
    try {
      setCameraPermission('requesting');
      // Simulate permission request delay
      setTimeout(() => {
        setCameraPermission('granted');
        setIsARActive(true);
      }, 1500);
    } catch (error) {
      setCameraPermission('denied');
    }
  };

  const stopAR = () => {
    setIsARActive(false);
    setSelectedProduct(null);
    setCameraPermission(null);
  };

  const ARViewer = () => (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        {/* Mock AR Camera View */}
        <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-64 h-80 mx-auto mb-4 bg-white/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Icon name="User" size={48} className="text-white/50 mx-auto mb-2" />
                <p className="text-white/70">AR Try-On Active</p>
                <p className="text-sm text-white/50">Move closer to see the fit</p>
              </div>
            </div>
            <div className="bg-black/50 rounded-lg p-4 max-w-sm mx-auto">
              <h3 className="font-semibold mb-1">{selectedProduct?.name}</h3>
              <p className="text-sm text-white/70">{selectedProduct?.brand} • {selectedProduct?.price}</p>
            </div>
          </div>
        </div>

        {/* AR Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Button variant="ghost" onClick={stopAR} className="text-white hover:bg-white/20">
            <Icon name="X" size={20} />
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <Icon name="RotateCcw" size={20} />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <Icon name="Camera" size={20} />
            </Button>
          </div>
        </div>

        {/* Size Selector */}
        <div className="absolute bottom-20 left-4 right-4">
          <div className="bg-black/70 rounded-lg p-4">
            <p className="text-white text-sm mb-2">Select Size:</p>
            <div className="flex space-x-2">
              {selectedProduct?.sizes?.map((size) => (
                <button
                  key={size}
                  className="px-3 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition-brand"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex space-x-3">
          <Button variant="outline" fullWidth className="text-white border-white hover:bg-white/20">
            Share
          </Button>
          <Button fullWidth className="bg-primary text-primary-foreground">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-xl shadow-brand p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Virtual Fitting Room</h2>
          <p className="text-text-secondary">Try on clothes virtually using AR technology</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Smartphone" size={20} className="text-secondary" />
          <span className="text-sm text-text-secondary">AR Enabled</span>
        </div>
      </div>
      {/* Feature Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="Eye" size={24} className="text-secondary" />
          </div>
          <h3 className="font-medium text-text-primary mb-1">See the Fit</h3>
          <p className="text-sm text-text-secondary">Visualize how clothes look on you before buying</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="Zap" size={24} className="text-secondary" />
          </div>
          <h3 className="font-medium text-text-primary mb-1">Instant Try-On</h3>
          <p className="text-sm text-text-secondary">No need to wait for delivery to see if it fits</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="Share2" size={24} className="text-secondary" />
          </div>
          <h3 className="font-medium text-text-primary mb-1">Share & Compare</h3>
          <p className="text-sm text-text-secondary">Get opinions from friends before purchasing</p>
        </div>
      </div>
      {/* AR-Enabled Products */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Try These Items</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {arEnabledProducts?.map((product) => (
            <div key={product?.id} className="border border-border rounded-lg overflow-hidden hover:shadow-brand transition-brand">
              <div className="relative">
                <img
                  src={product?.image}
                  alt={product?.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
                  AR
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-text-primary mb-1">{product?.name}</h4>
                <p className="text-sm text-text-secondary mb-2">{product?.brand}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">{product?.price}</span>
                  <Button
                    size="sm"
                    onClick={() => handleTryOn(product)}
                    iconName="Camera"
                    iconPosition="left"
                  >
                    Try On
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Camera Permission Modal */}
      {cameraPermission === 'requesting' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Camera" size={32} className="text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Camera Access Required</h3>
              <p className="text-text-secondary mb-4">
                We need access to your camera to enable the virtual try-on feature. Your privacy is protected - no images are stored.
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-text-secondary">Requesting permission...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Camera Permission Denied */}
      {cameraPermission === 'denied' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CameraOff" size={32} className="text-error" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Camera Access Denied</h3>
              <p className="text-text-secondary mb-4">
                Camera access is required for the virtual try-on feature. Please enable camera permissions in your browser settings.
              </p>
              <Button onClick={() => setCameraPermission(null)} fullWidth>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* AR Viewer */}
      {isARActive && <ARViewer />}
      {/* System Requirements */}
      <div className="mt-8 p-4 bg-surface rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-secondary mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary mb-1">System Requirements</h4>
            <p className="text-sm text-text-secondary mb-2">
              Virtual try-on works best on modern smartphones and tablets with rear-facing cameras.
            </p>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• iOS 12+ (Safari) or Android 8+ (Chrome)</li>
              <li>• Good lighting conditions recommended</li>
              <li>• Stand 3-4 feet away from camera for best results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualFittingSection;