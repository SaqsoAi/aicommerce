"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import DashboardHeader from './components/DashboardHeader';
import QuickActions from './components/QuickActions';
import RecentOrders from './components/RecentOrders';
import StyleProfile from './components/StyleProfile';
import WishlistPreview from './components/WishlistPreview';
import LoyaltyProgram from './components/LoyaltyProgram';
import PersonalizedRecommendations from './components/PersonalizedRecommendations';
import AccountSettings from './components/AccountSettings';
import Icon from '../../components/AppIcon';


const UserAccountDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Mock user data
  const userData = {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    memberSince: "March 2022",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    gender: "Female",
    addresses: [
      {
        type: "Home",
        street: "123 Fashion Ave",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        isDefault: true
      },
      {
        type: "Work",
        street: "456 Business Blvd",
        city: "New York",
        state: "NY",
        zipCode: "10002",
        isDefault: false
      }
    ],
    paymentMethods: [
      {
        id: 1,
        brand: "Visa",
        last4: "4242",
        expiry: "12/25",
        isDefault: true
      },
      {
        id: 2,
        brand: "Mastercard",
        last4: "8888",
        expiry: "08/26",
        isDefault: false
      }
    ],
    notifications: {
      orderUpdates: {
        email: true,
        sms: true,
        push: true
      },
      promotions: {
        email: true,
        sms: false,
        push: true
      },
      styleUpdates: {
        email: true,
        sms: false,
        push: false
      }
    }
  };

  const loyaltyPoints = 2450;
  const membershipTier = "Gold";

  // Mock orders data
  const recentOrders = [
    {
      id: 1,
      orderNumber: "SH2024001",
      status: "Delivered",
      orderDate: "Dec 15, 2024",
      total: "189.99",
      estimatedDelivery: null,
      items: [
        {
          name: "Classic Wool Coat",
          image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop"
        },
        {
          name: "Silk Scarf",
          image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=100&h=100&fit=crop"
        }
      ]
    },
    {
      id: 2,
      orderNumber: "SH2024002",
      status: "Shipped",
      orderDate: "Dec 20, 2024",
      total: "299.50",
      estimatedDelivery: "Dec 28, 2024",
      items: [
        {
          name: "Designer Handbag",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop"
        },
        {
          name: "Leather Boots",
          image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop"
        },
        {
          name: "Cashmere Sweater",
          image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=100&h=100&fit=crop"
        }
      ]
    },
    {
      id: 3,
      orderNumber: "SH2024003",
      status: "Processing",
      orderDate: "Dec 25, 2024",
      total: "125.00",
      estimatedDelivery: "Jan 2, 2025",
      items: [
        {
          name: "Denim Jacket",
          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop"
        }
      ]
    }
  ];

  // Mock style profile data
  const styleProfile = {
    stylePersonality: ["classic", "trendy"],
    preferredColors: [
      { name: "Navy", hex: "#1e3a8a" },
      { name: "Cream", hex: "#fef3c7" },
      { name: "Blush", hex: "#fce7f3" },
      { name: "Sage", hex: "#84cc16" }
    ],
    sizePreferences: {
      tops: "M",
      bottoms: "8",
      shoes: "7.5",
      dresses: "M"
    },
    styleMatch: 92,
    styleDescription: `You have a sophisticated style that blends timeless classics with contemporary trends. You prefer quality pieces that can transition from day to night, with a focus on neutral colors and elegant silhouettes.`
  };

  // Mock wishlist data
  const wishlists = [
    {
      id: 1,
      name: "Work Wardrobe",
      lastUpdated: "2 days ago",
      items: [
        {
          name: "Blazer",
          image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop"
        },
        {
          name: "Trousers",
          image: "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=100&h=100&fit=crop"
        },
        {
          name: "Blouse",
          image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=100&h=100&fit=crop"
        }
      ]
    },
    {
      id: 2,
      name: "Weekend Looks",
      lastUpdated: "1 week ago",
      items: [
        {
          name: "Casual Dress",
          image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100&h=100&fit=crop"
        },
        {
          name: "Sneakers",
          image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop"
        }
      ]
    },
    {
      id: 3,
      name: "Special Occasions",
      lastUpdated: "3 weeks ago",
      items: [
        {
          name: "Evening Gown",
          image: "https://images.unsplash.com/photo-1566479179817-c0b5b7b9a7b7?w=100&h=100&fit=crop"
        }
      ]
    }
  ];

  // Mock loyalty program data
  const loyaltyData = {
    points: loyaltyPoints,
    tier: membershipTier,
    nextTier: "Platinum",
    pointsToNextTier: 550,
    availableRewards: [
      {
        id: 1,
        title: "Free Shipping",
        description: "Free shipping on your next order",
        points: 100,
        icon: "Truck"
      },
      {
        id: 2,
        title: "15% Off Coupon",
        description: "15% discount on any item",
        points: 250,
        icon: "Percent"
      },
      {
        id: 3,
        title: "Style Consultation",
        description: "30-minute personal styling session",
        points: 500,
        icon: "Users"
      },
      {
        id: 4,
        title: "VIP Early Access",
        description: "Early access to new collections",
        points: 750,
        icon: "Star"
      }
    ],
    recentActivity: [
      {
        type: "earned",
        description: "Purchase reward",
        points: 189,
        date: "Dec 15, 2024"
      },
      {
        type: "earned",
        description: "Review bonus",
        points: 25,
        date: "Dec 10, 2024"
      },
      {
        type: "redeemed",
        description: "Free shipping reward",
        points: 100,
        date: "Dec 5, 2024"
      }
    ]
  };

  // Mock recommendations data
  const recommendations = [
    {
      id: 1,
      name: "Cashmere Turtleneck",
      brand: "Luxury Essentials",
      price: "149.99",
      originalPrice: "199.99",
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop",
      rating: 4.8,
      isNew: false,
      discount: 25,
      reason: "Matches your classic style"
    },
    {
      id: 2,
      name: "Midi Wrap Dress",
      brand: "Modern Feminine",
      price: "89.99",
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop",
      rating: 4.6,
      isNew: true,
      reason: "Perfect for work occasions"
    },
    {
      id: 3,
      name: "Leather Ankle Boots",
      brand: "Urban Steps",
      price: "179.99",
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop",
      rating: 4.9,
      isNew: false,
      reason: "Complements your wardrobe"
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'orders', label: 'Order History', icon: 'Package' },
    { id: 'wishlist', label: 'Wishlist', icon: 'Heart' },
    { id: 'style-profile', label: 'Style Profile', icon: 'User' },
    { id: 'rewards', label: 'Rewards', icon: 'Gift' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'track-order': setActiveSection('orders');
        break;
      case 'wishlist': setActiveSection('wishlist');
        break;
      case 'size-guide':
        window.location.href = '/size-fit-center';
        break;
      case 'style-quiz': setActiveSection('style-profile');
        break;
      case 'rewards': setActiveSection('rewards');
        break;
      case 'support':
        // Open support chat
        break;
      default:
        break;
    }
  };

  const handleViewAllOrders = () => {
    setActiveSection('orders');
  };

  const handleTrackOrder = (orderId) => {
    console.log('Tracking order:', orderId);
  };

  const handleReorder = (orderId) => {
    console.log('Reordering:', orderId);
  };

  const handleUpdateProfile = () => {
    console.log('Updating style profile');
  };

  const handleViewWishlist = (wishlistId) => {
    setActiveSection('wishlist');
  };

  const handleCreateWishlist = () => {
    console.log('Creating new wishlist');
  };

  const handleRedeemReward = (rewardId) => {
    console.log('Redeeming reward:', rewardId);
  };

  const handleViewRewards = () => {
    setActiveSection('rewards');
  };

  const handleViewProduct = (productId) => {
    window.location.href = `/product-detail-page?id=${productId}`;
  };

  const handleAddToWishlist = (productId) => {
    console.log('Adding to wishlist:', productId);
  };

  const handleUpdateSettings = () => {
    console.log('Updating account settings');
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <QuickActions onActionClick={handleQuickAction} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <RecentOrders
                orders={recentOrders?.slice(0, 3)}
                onViewAllOrders={handleViewAllOrders}
                onTrackOrder={handleTrackOrder}
                onReorder={handleReorder}
              />
              <WishlistPreview
                wishlists={wishlists}
                onViewWishlist={handleViewWishlist}
                onCreateWishlist={handleCreateWishlist}
              />
            </div>
            <PersonalizedRecommendations
              recommendations={recommendations}
              onViewProduct={handleViewProduct}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>
        );
      case 'orders':
        return (
          <RecentOrders
            orders={recentOrders}
            onViewAllOrders={handleViewAllOrders}
            onTrackOrder={handleTrackOrder}
            onReorder={handleReorder}
          />
        );
      case 'wishlist':
        return (
          <WishlistPreview
            wishlists={wishlists}
            onViewWishlist={handleViewWishlist}
            onCreateWishlist={handleCreateWishlist}
          />
        );
      case 'style-profile':
        return (
          <StyleProfile
            profile={styleProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'rewards':
        return (
          <LoyaltyProgram
            loyaltyData={loyaltyData}
            onRedeemReward={handleRedeemReward}
            onViewRewards={handleViewRewards}
          />
        );
      case 'settings':
        return (
          <AccountSettings
            userSettings={userData}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardHeader
            user={userData}
            loyaltyPoints={loyaltyPoints}
            membershipTier={membershipTier}
          />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-card rounded-xl p-4 shadow-brand sticky top-24">
                <nav className="space-y-1">
                  {sidebarItems?.map((item) => (
                    <button
                      key={item?.id}
                      onClick={() => setActiveSection(item?.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-brand ${
                        activeSection === item?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                      }`}
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Mobile Quick Stats */}
                <div className="mt-6 pt-6 border-t border-border lg:hidden">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{loyaltyPoints?.toLocaleString()}</div>
                      <div className="text-xs text-text-secondary">Points</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary">{membershipTier}</div>
                      <div className="text-xs text-text-secondary">Tier</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-4 gap-1 p-2">
          {sidebarItems?.slice(0, 4)?.map((item) => (
            <button
              key={item?.id}
              onClick={() => setActiveSection(item?.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-brand ${
                activeSection === item?.id
                  ? 'text-primary bg-primary/10' :'text-text-secondary'
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span className="text-xs font-medium">{item?.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserAccountDashboard;