"use client";

import React, { useState } from 'react';
import { usePathname } from "next/navigation";
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { name: 'New Arrivals', path: '/homepage', icon: 'Sparkles' },
    { name: 'Catalog', path: '/product-catalog', icon: 'Grid3X3' },
    { name: 'Size Guide', path: '/size-fit-center', icon: 'Ruler' },
    { name: 'Account', path: '/user-account-dashboard', icon: 'User' },
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCartClick = () => {
    window.location.href = '/shopping-cart-checkout';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/homepage" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-primary-foreground"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16.21 2.84.21 4 0 5.16-1 9-5.45 9-11V7l-10-5z"/>
                  <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-semibold text-primary font-accent">StyleHub</span>
                <span className="text-sm text-text-secondary ml-1">Commerce</span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems?.map((item) => (
              <a
                key={item?.path}
                href={item?.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-brand ${
                  isActivePath(item?.path)
                    ? 'text-primary bg-surface' :'text-text-secondary hover:text-primary hover:bg-surface/50'
                }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.name}</span>
              </a>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Search" size={16} className="text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search styles, brands, or trends..."
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-brand"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Toggle - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchToggle}
              className="md:hidden"
            >
              <Icon name="Search" size={20} />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Icon name="Heart" size={20} />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" onClick={handleCartClick} className="relative">
              <Icon name="ShoppingBag" size={20} />
              <span className="absolute -top-1 -right-1 bg-cta text-cta-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
              className="lg:hidden"
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Search" size={16} className="text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search styles, brands, or trends..."
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-brand"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <nav className="space-y-2">
              {navigationItems?.map((item) => (
                <a
                  key={item?.path}
                  href={item?.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-brand ${
                    isActivePath(item?.path)
                      ? 'text-primary bg-surface' :'text-text-secondary hover:text-primary hover:bg-surface/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.name}</span>
                </a>
              ))}
              
              {/* Mobile-only items */}
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface/50 transition-brand sm:hidden"
              >
                <Icon name="Heart" size={18} />
                <span>Wishlist</span>
              </a>
              
              <div className="pt-4 mt-4 border-t border-border">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-text-secondary">Free shipping & returns</span>
                  <Icon name="Truck" size={16} className="text-success" />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-text-secondary">24/7 Style support</span>
                  <Icon name="MessageCircle" size={16} className="text-secondary" />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;