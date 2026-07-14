"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CartItem from './components/CartItem';
import OrderSummary from './components/OrderSummary';
import RecommendedItems from './components/RecommendedItems';
import CheckoutForm from './components/CheckoutForm';
import MiniCart from './components/MiniCart';

const ShoppingCartCheckout = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Cotton Blend Oversized Hoodie - Minimalist Design",
      brand: "StyleHub Essentials",
      price: 89.99,
      originalPrice: 119.99,
      quantity: 2,
      size: "M",
      color: "Charcoal Gray",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      lowStock: false,
      stockCount: 15
    },
    {
      id: 2,
      name: "High-Waisted Straight Leg Denim Jeans - Sustainable Collection",
      brand: "EcoThread",
      price: 125.00,
      originalPrice: null,
      quantity: 1,
      size: "28",
      color: "Dark Indigo",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop",
      lowStock: true,
      stockCount: 3
    }
  ]);

  const [recommendedItems] = useState([
    {
      id: 101,
      name: "Ribbed Knit Turtleneck Sweater",
      brand: "StyleHub Basics",
      price: 65.00,
      originalPrice: 85.00,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
      rating: 4.8,
      isNew: false,
      discount: 24
    },
    {
      id: 102,
      name: "Leather Crossbody Bag - Cognac",
      brand: "Heritage Craft",
      price: 149.99,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      rating: 4.9,
      isNew: true,
      discount: null
    },
    {
      id: 103,
      name: "Classic White Sneakers",
      brand: "Urban Steps",
      price: 95.00,
      originalPrice: 120.00,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      rating: 4.7,
      isNew: false,
      discount: 21
    }
  ]);

  const [customersAlsoBought] = useState([
    {
      id: 201,
      name: "Merino Wool Scarf - Camel",
      brand: "Luxe Accessories",
      price: 78.00,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=400&fit=crop",
      rating: 4.6,
      isNew: false,
      discount: null
    },
    {
      id: 202,
      name: "Minimalist Watch - Rose Gold",
      brand: "TimeCore",
      price: 189.99,
      originalPrice: 249.99,
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
      rating: 4.8,
      isNew: true,
      discount: 24
    }
  ]);

  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0);
  const shipping = subtotal >= 75 ? 0 : 8.99;
  const tax = subtotal * 0.08875; // NY tax rate
  const total = subtotal + shipping + tax - appliedDiscount;

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems(prev => 
      prev?.map(item => 
        item?.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev?.filter(item => item?.id !== itemId));
  };

  const handleMoveToWishlist = (itemId) => {
    // Mock implementation - in real app would call API
    console.log('Moving item to wishlist:', itemId);
    handleRemoveItem(itemId);
  };

  const handleApplyDiscount = (code) => {
    setDiscountError('');
    
    // Mock discount codes
    const validCodes = {
      'WELCOME10': 0.10,
      'SAVE20': 0.20,
      'FIRST15': 0.15
    };

    if (validCodes?.[code?.toUpperCase()]) {
      const discountAmount = subtotal * validCodes?.[code?.toUpperCase()];
      setAppliedDiscount(discountAmount);
      setDiscountCode('');
    } else {
      setDiscountError('Invalid discount code');
    }
  };

  const handleAddToCart = (item) => {
    // Mock implementation - in real app would call API
    console.log('Adding to cart:', item);
    setCartItems(prev => [...prev, { ...item, quantity: 1, size: 'M', color: 'Default' }]);
  };

  const handleCheckoutSubmit = async (formData) => {
    setIsSubmitting(true);
    
    // Mock API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to confirmation page
      console.log('Order submitted:', formData);
      alert('Order placed successfully! Redirecting to confirmation page...');
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueShopping = () => {
    window.location.href = '/product-catalog';
  };

  const handleViewCart = () => {
    setShowMiniCart(false);
    setShowCheckout(false);
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-8">
              <a href="/homepage" className="hover:text-primary">Home</a>
              <Icon name="ChevronRight" size={16} />
              <button onClick={() => setShowCheckout(false)} className="hover:text-primary">Cart</button>
              <Icon name="ChevronRight" size={16} />
              <span className="text-text-primary">Checkout</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <CheckoutForm onSubmit={handleCheckoutSubmit} isLoading={isSubmitting} />
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  discount={appliedDiscount}
                  total={total}
                  discountCode={discountCode}
                  onDiscountCodeChange={setDiscountCode}
                  onApplyDiscount={handleApplyDiscount}
                  discountError={discountError}
                  isSticky={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Mini Cart */}
      <MiniCart
        isOpen={showMiniCart}
        onClose={() => setShowMiniCart(false)}
        items={cartItems}
        subtotal={subtotal}
        onViewCart={handleViewCart}
      />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-8">
            <a href="/homepage" className="hover:text-primary">Home</a>
            <Icon name="ChevronRight" size={16} />
            <span className="text-text-primary">Shopping Cart</span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Shopping Cart</h1>
              <p className="text-text-secondary">
                {cartItems?.length} {cartItems?.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Button variant="outline" onClick={handleContinueShopping}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Continue Shopping
            </Button>
          </div>

          {cartItems?.length === 0 ? (
            /* Empty Cart State */
            (<div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Icon name="ShoppingBag" size={64} className="text-text-secondary mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-text-primary mb-4">Your cart is empty</h2>
                <p className="text-text-secondary mb-8">
                  Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
                </p>
                <Button onClick={handleContinueShopping}>
                  Start Shopping
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
            </div>)
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cart Items List */}
                <div className="space-y-4">
                  {cartItems?.map((item) => (
                    <CartItem
                      key={item?.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      onMoveToWishlist={handleMoveToWishlist}
                    />
                  ))}
                </div>

                {/* Recommended Items */}
                <RecommendedItems
                  items={recommendedItems}
                  onAddToCart={handleAddToCart}
                  title="Complete Your Look"
                />

                {/* Customers Also Bought */}
                <RecommendedItems
                  items={customersAlsoBought}
                  onAddToCart={handleAddToCart}
                  title="Customers Also Bought"
                />
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  discount={appliedDiscount}
                  total={total}
                  discountCode={discountCode}
                  onDiscountCodeChange={setDiscountCode}
                  onApplyDiscount={handleApplyDiscount}
                  discountError={discountError}
                  isSticky={true}
                />

                {/* Checkout Button */}
                <div className="mt-6">
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => setShowCheckout(true)}
                    className="mb-4"
                  >
                    <Icon name="Lock" size={16} className="mr-2" />
                    Secure Checkout
                  </Button>
                  
                  {/* Alternative Payment Methods */}
                  <div className="space-y-2">
                    <Button variant="outline" fullWidth className="bg-[#FFC439] hover:bg-[#FFB800] text-black border-[#FFC439]">
                      <span className="font-semibold">PayPal</span>
                    </Button>
                    <Button variant="outline" fullWidth className="bg-black hover:bg-gray-800 text-white border-black">
                      <Icon name="Apple" size={16} className="mr-2" />
                      Apple Pay
                    </Button>
                    <Button variant="outline" fullWidth className="bg-[#FFB3C7] hover:bg-[#FF9BB5] text-black border-[#FFB3C7]">
                      <span className="font-semibold">Klarna</span>
                    </Button>
                  </div>
                </div>

                {/* Security & Trust Signals */}
                <div className="mt-6 p-4 bg-surface rounded-lg">
                  <h4 className="font-medium text-text-primary mb-3">Why shop with us?</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="Shield" size={14} className="text-success" />
                      <span className="text-text-secondary">SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="RotateCcw" size={14} className="text-success" />
                      <span className="text-text-secondary">30-day free returns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Truck" size={14} className="text-success" />
                      <span className="text-text-secondary">Free shipping over $75</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="MessageCircle" size={14} className="text-success" />
                      <span className="text-text-secondary">24/7 customer support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartCheckout;