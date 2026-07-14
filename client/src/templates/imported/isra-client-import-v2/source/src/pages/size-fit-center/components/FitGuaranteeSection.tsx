"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FitGuaranteeSection = () => {
  const [selectedTab, setSelectedTab] = useState('guarantee');

  const guaranteeFeatures = [
    {
      icon: 'Shield',
      title: '30-Day Fit Guarantee',
      description: 'Free exchanges for size-related returns within 30 days of purchase',
      details: [
        'No questions asked size exchanges',
        'Free return shipping included',
        'Keep original packaging for fastest processing',
        'Exchange for different size or full refund'
      ]
    },
    {
      icon: 'Truck',
      title: 'Free Exchange Shipping',
      description: 'We cover all shipping costs for size-related exchanges',
      details: [
        'Prepaid return labels included',
        'Express shipping on replacement items',
        'No additional costs to you',
        'Track your exchange every step'
      ]
    },
    {
      icon: 'Clock',
      title: 'Quick Processing',
      description: 'Fast turnaround on all fit-related exchanges',
      details: [
        '24-hour processing once received',
        '2-3 day shipping on replacements',
        'Email updates throughout process',
        'Priority handling for fit exchanges'
      ]
    }
  ];

  const exchangeSteps = [
    {
      step: 1,
      title: 'Initiate Exchange',
      description: 'Start your exchange online or contact customer service',
      icon: 'MousePointer',
      details: 'Use your order number to quickly start the exchange process. Our system will guide you through size selection.'
    },
    {
      step: 2,
      title: 'Pack & Ship',
      description: 'Use the prepaid label to send back your item',
      icon: 'Package',
      details: 'Keep items in original condition with tags attached. Use the provided return packaging when possible.'
    },
    {
      step: 3,
      title: 'We Process',
      description: 'Quick inspection and processing of your return',
      icon: 'CheckCircle',
      details: 'Our team inspects items within 24 hours and immediately processes your exchange or refund.'
    },
    {
      step: 4,
      title: 'Receive New Size',
      description: 'Get your perfect fit delivered fast',
      icon: 'Home',
      details: 'New size ships within 24 hours via express delivery. Track your package every step of the way.'
    }
  ];

  const faqItems = [
    {
      question: 'What qualifies for the Fit Guarantee?',
      answer: 'Any size-related concern qualifies - too big, too small, different fit than expected, or length issues. Items must be in original condition with tags attached.'
    },
    {
      question: 'How long do I have to exchange?',
      answer: 'You have 30 days from delivery date to initiate a fit-related exchange. We recommend trying items on as soon as possible after delivery.'
    },
    {
      question: 'Can I exchange sale items?',
      answer: 'Yes! Our Fit Guarantee applies to all items, including sale and clearance pieces. The same 30-day policy applies regardless of original price.'
    },
    {
      question: 'What if the new size is out of stock?',
      answer: 'If your preferred size is unavailable, we\'ll offer a full refund or help you find a similar item in your size. You can also join the waitlist for restocks.'
    },
    {
      question: 'Do you exchange international orders?',
      answer: 'Yes, but international customers are responsible for return shipping costs. We\'ll cover the shipping for your replacement item.'
    },
    {
      question: 'Can I exchange multiple items at once?',
      answer: 'Absolutely! You can exchange multiple items from the same order or even different orders in one return package.'
    }
  ];

  const [expandedFAQ, setExpandedFAQ] = useState(null);

  return (
    <div className="bg-card rounded-xl shadow-brand p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Fit Guarantee Program</h2>
          <p className="text-text-secondary">Shop with confidence - we guarantee the perfect fit</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={20} className="text-success" />
          <span className="text-sm text-success font-medium">Protected</span>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-surface rounded-lg p-1">
        <button
          onClick={() => setSelectedTab('guarantee')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-brand ${
            selectedTab === 'guarantee' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Shield" size={16} />
            <span>Guarantee Details</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('process')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-brand ${
            selectedTab === 'process' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Icon name="RefreshCw" size={16} />
            <span>Exchange Process</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('faq')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-brand ${
            selectedTab === 'faq' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Icon name="HelpCircle" size={16} />
            <span>FAQ</span>
          </div>
        </button>
      </div>
      {/* Guarantee Details Tab */}
      {selectedTab === 'guarantee' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guaranteeFeatures?.map((feature, index) => (
              <div key={index} className="text-center p-6 border border-border rounded-lg hover:shadow-brand transition-brand">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={feature?.icon} size={32} className="text-success" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature?.title}</h3>
                <p className="text-text-secondary mb-4">{feature?.description}</p>
                <ul className="text-sm text-text-secondary space-y-1">
                  {feature?.details?.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start space-x-2">
                      <Icon name="Check" size={14} className="text-success mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-success/5 border border-success/20 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <Icon name="Info" size={24} className="text-success mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Why We Offer This Guarantee</h3>
                <p className="text-text-secondary mb-3">
                  We believe everyone deserves clothes that fit perfectly. Online shopping can be challenging when it comes to sizing, 
                  so we've eliminated that risk completely. Our Fit Guarantee means you can shop with complete confidence.
                </p>
                <p className="text-text-secondary">
                  <strong>Our Promise:</strong> If any item doesn't fit as expected, we'll make it right - no hassle, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Exchange Process Tab */}
      {selectedTab === 'process' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {exchangeSteps?.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                    <Icon name={step?.icon} size={24} className="text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-secondary-foreground">{step?.step}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{step?.title}</h3>
                <p className="text-text-secondary mb-3">{step?.description}</p>
                <p className="text-sm text-text-secondary">{step?.details}</p>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Exchange Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Icon name="Clock" size={16} className="text-secondary mt-1" />
                  <div>
                    <h4 className="font-medium text-text-primary">Fastest Processing</h4>
                    <p className="text-sm text-text-secondary">Keep original packaging and tags for quickest turnaround</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon name="Smartphone" size={16} className="text-secondary mt-1" />
                  <div>
                    <h4 className="font-medium text-text-primary">Track Everything</h4>
                    <p className="text-sm text-text-secondary">Get real-time updates via SMS and email</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Icon name="MessageCircle" size={16} className="text-secondary mt-1" />
                  <div>
                    <h4 className="font-medium text-text-primary">Need Help?</h4>
                    <p className="text-sm text-text-secondary">Chat with our fit specialists anytime</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon name="Star" size={16} className="text-secondary mt-1" />
                  <div>
                    <h4 className="font-medium text-text-primary">VIP Treatment</h4>
                    <p className="text-sm text-text-secondary">Loyalty members get priority processing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" iconName="RefreshCw" iconPosition="left">
              Start an Exchange
            </Button>
          </div>
        </div>
      )}
      {/* FAQ Tab */}
      {selectedTab === 'faq' && (
        <div className="space-y-4">
          {faqItems?.map((item, index) => (
            <div key={index} className="border border-border rounded-lg">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-surface transition-brand"
              >
                <h3 className="font-medium text-text-primary">{item?.question}</h3>
                <Icon 
                  name={expandedFAQ === index ? "ChevronUp" : "ChevronDown"} 
                  size={20} 
                  className="text-text-secondary" 
                />
              </button>
              {expandedFAQ === index && (
                <div className="px-4 pb-4">
                  <p className="text-text-secondary">{item?.answer}</p>
                </div>
              )}
            </div>
          ))}

          <div className="mt-8 p-6 bg-surface rounded-lg text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Still Have Questions?</h3>
            <p className="text-text-secondary mb-4">
              Our customer service team is here to help with any fit or sizing concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" iconName="MessageCircle" iconPosition="left">
                Live Chat
              </Button>
              <Button variant="outline" iconName="Phone" iconPosition="left">
                Call Us
              </Button>
              <Button variant="outline" iconName="Mail" iconPosition="left">
                Email Support
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitGuaranteeSection;