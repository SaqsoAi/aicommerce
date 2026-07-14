"use client";

import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SizeGuideSection from './components/SizeGuideSection';
import FindYourSizeSection from './components/FindYourSizeSection';
import FitGuideSection from './components/FitGuideSection';
import VirtualFittingSection from './components/VirtualFittingSection';
import CustomerFitFeedback from './components/CustomerFitFeedback';
import FitGuaranteeSection from './components/FitGuaranteeSection';
import MeasuringGuideSection from './components/MeasuringGuideSection';

const SizeFitCenter = () => {
  const [activeSection, setActiveSection] = useState('size-guide');

  const navigationSections = [
    { id: 'size-guide', name: 'Size Guide', icon: 'Ruler', description: 'Brand-specific size charts and conversions' },
    { id: 'find-size', name: 'Find Your Size', icon: 'Target', description: 'Personalized size recommendations' },
    { id: 'fit-guide', name: 'Fit Guide', icon: 'Shirt', description: 'Understanding different fits and body types' },
    { id: 'virtual-fitting', name: 'Virtual Try-On', icon: 'Smartphone', description: 'AR-powered virtual fitting room' },
    { id: 'customer-feedback', name: 'Customer Fit Reviews', icon: 'Users', description: 'Real customer fit experiences' },
    { id: 'measuring-guide', name: 'How to Measure', icon: 'Compass', description: 'Step-by-step measuring instructions' },
    { id: 'fit-guarantee', name: 'Fit Guarantee', icon: 'Shield', description: 'Our 30-day fit guarantee program' }
  ];

  const quickStats = [
    { label: 'Size Charts', value: '50+', icon: 'BarChart3', color: 'text-primary' },
    { label: 'Fit Reviews', value: '12.5K+', icon: 'MessageSquare', color: 'text-secondary' },
    { label: 'Perfect Fits', value: '94%', icon: 'Target', color: 'text-success' },
    { label: 'AR Items', value: '200+', icon: 'Smartphone', color: 'text-accent' }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'size-guide':
        return <SizeGuideSection />;
      case 'find-size':
        return <FindYourSizeSection />;
      case 'fit-guide':
        return <FitGuideSection />;
      case 'virtual-fitting':
        return <VirtualFittingSection />;
      case 'customer-feedback':
        return <CustomerFitFeedback />;
      case 'measuring-guide':
        return <MeasuringGuideSection />;
      case 'fit-guarantee':
        return <FitGuaranteeSection />;
      default:
        return <SizeGuideSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-to-br from-surface to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Ruler" size={32} className="text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Size & Fit Center
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              Find your perfect fit with our comprehensive sizing tools, virtual try-on technology, 
              and expert guidance. Shop with confidence knowing we guarantee the perfect fit.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {quickStats?.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon name={stat?.icon} size={24} className={stat?.color} />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">{stat?.value}</div>
                  <div className="text-sm text-text-secondary">{stat?.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-brand p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Fit & Size Tools</h2>
                <nav className="space-y-2">
                  {navigationSections?.map((section) => (
                    <button
                      key={section?.id}
                      onClick={() => setActiveSection(section?.id)}
                      className={`w-full text-left p-3 rounded-lg transition-brand ${
                        activeSection === section?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-surface text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon name={section?.icon} size={18} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{section?.name}</div>
                          <div className={`text-xs mt-1 ${
                            activeSection === section?.id 
                              ? 'text-primary-foreground/80' 
                              : 'text-text-secondary'
                          }`}>
                            {section?.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-text-primary mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      iconName="MessageCircle"
                      iconPosition="left"
                    >
                      Chat with Fit Expert
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      iconName="Download"
                      iconPosition="left"
                    >
                      Download Size Guide
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </section>
      {/* Help Section */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Still Need Help?</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Our fit specialists are here to help you find the perfect size and fit for any item in our collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 text-center hover:shadow-brand transition-brand">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="MessageCircle" size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Live Chat</h3>
              <p className="text-text-secondary mb-4">
                Chat with our fit specialists for personalized sizing advice and recommendations.
              </p>
              <Button iconName="MessageCircle" iconPosition="left">
                Start Chat
              </Button>
            </div>

            <div className="bg-card rounded-xl p-6 text-center hover:shadow-brand transition-brand">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Video" size={32} className="text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Virtual Consultation</h3>
              <p className="text-text-secondary mb-4">
                Book a one-on-one video consultation with our styling and fit experts.
              </p>
              <Button variant="secondary" iconName="Calendar" iconPosition="left">
                Book Session
              </Button>
            </div>

            <div className="bg-card rounded-xl p-6 text-center hover:shadow-brand transition-brand">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Phone" size={32} className="text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Phone Support</h3>
              <p className="text-text-secondary mb-4">
                Call our customer service team for immediate assistance with sizing questions.
              </p>
              <Button variant="outline" iconName="Phone" iconPosition="left">
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16.21 2.84.21 4 0 5.16-1 9-5.45 9-11V7l-10-5z"/>
                    <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <span className="text-xl font-semibold font-accent">StyleHub Commerce</span>
              </div>
              <p className="text-primary-foreground/80 mb-4">
                Your trusted partner in finding the perfect fit. We're committed to making online shopping 
                as confident and satisfying as shopping in-store.
              </p>
              <div className="flex space-x-4">
                <Icon name="Facebook" size={20} className="text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-brand" />
                <Icon name="Twitter" size={20} className="text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-brand" />
                <Icon name="Instagram" size={20} className="text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-brand" />
                <Icon name="Youtube" size={20} className="text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-brand" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Size & Fit</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-brand">Size Charts</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-brand">Measuring Guide</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-brand">Fit Guarantee</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-brand">Virtual Try-On</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-brand">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-brand">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-brand">Shipping Info</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-brand">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60 text-sm">
              © {new Date()?.getFullYear()} StyleHub Commerce. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-brand">Privacy Policy</a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-brand">Terms of Service</a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-brand">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SizeFitCenter;