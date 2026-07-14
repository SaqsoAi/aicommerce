"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FitGuideSection = () => {
  const [selectedFitType, setSelectedFitType] = useState('regular');

  const fitTypes = [
    {
      id: 'slim',
      name: 'Slim Fit',
      icon: 'Minimize2',
      description: 'Close-fitting silhouette that follows body contours',
      characteristics: [
        'Tapered through waist and hips',
        'Minimal ease for movement',
        'Modern, streamlined appearance',
        'Best for lean body types'
      ],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=center'
    },
    {
      id: 'regular',
      name: 'Regular Fit',
      icon: 'Square',
      description: 'Classic fit with comfortable room for movement',
      characteristics: [
        'Balanced proportions',
        'Comfortable ease through body',
        'Versatile for most body types',
        'Timeless, classic appearance'
      ],
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=center'
    },
    {
      id: 'relaxed',
      name: 'Relaxed Fit',
      icon: 'Maximize2',
      description: 'Loose, comfortable fit with generous room',
      characteristics: [
        'Roomy through chest and waist',
        'Maximum comfort and mobility',
        'Casual, laid-back style',
        'Great for layering'
      ],
      image: 'https://images.unsplash.com/photo-1506629905607-d9f02a6a0f7b?w=300&h=400&fit=crop&crop=center'
    }
  ];

  const bodyTypeGuides = [
    {
      type: 'Pear Shape',
      icon: 'Triangle',
      description: 'Hips wider than shoulders',
      recommendations: [
        'Emphasize upper body with detailed tops',
        'Choose A-line or straight-leg bottoms',
        'Avoid tight-fitting bottoms',
        'Try tops with horizontal stripes or patterns'
      ],
      colors: 'text-purple-600 bg-purple-50'
    },
    {
      type: 'Apple Shape',
      icon: 'Circle',
      description: 'Fuller midsection with narrower hips',
      recommendations: [
        'Choose empire waist or A-line dresses',
        'Highlight legs with fitted bottoms',
        'Avoid clingy fabrics around midsection',
        'Try V-necks to elongate torso'
      ],
      colors: 'text-red-600 bg-red-50'
    },
    {
      type: 'Hourglass',
      icon: 'Hourglass',
      description: 'Balanced shoulders and hips with defined waist',
      recommendations: [
        'Emphasize waist with fitted styles',
        'Choose wrap dresses and belted tops',
        'Avoid boxy or oversized fits',
        'Try high-waisted bottoms'
      ],
      colors: 'text-green-600 bg-green-50'
    },
    {
      type: 'Rectangle',
      icon: 'Square',
      description: 'Similar measurements throughout',
      recommendations: [
        'Create curves with peplum tops',
        'Try layering to add dimension',
        'Choose patterns and textures',
        'Experiment with different silhouettes'
      ],
      colors: 'text-blue-600 bg-blue-50'
    }
  ];

  const fabricGuides = [
    {
      name: 'Cotton',
      stretch: 'Low',
      drape: 'Structured',
      care: 'Machine wash',
      fit_note: 'May shrink slightly after first wash',
      icon: 'Leaf'
    },
    {
      name: 'Denim',
      stretch: 'Low-Medium',
      drape: 'Structured',
      care: 'Machine wash cold',
      fit_note: 'Stretches with wear, size down if unsure',
      icon: 'Shirt'
    },
    {
      name: 'Jersey/Modal',
      stretch: 'High',
      drape: 'Fluid',
      care: 'Machine wash',
      fit_note: 'Very forgiving fit, true to size',
      icon: 'Waves'
    },
    {
      name: 'Polyester Blend',
      stretch: 'Medium',
      drape: 'Structured',
      care: 'Machine wash',
      fit_note: 'Maintains shape well, consistent sizing',
      icon: 'Zap'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Fit Types Section */}
      <div className="bg-card rounded-xl shadow-brand p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Fit Guide</h2>
            <p className="text-text-secondary">Understanding different fit types and how they work with your body</p>
          </div>
          <Icon name="Shirt" size={24} className="text-secondary" />
        </div>

        {/* Fit Type Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {fitTypes?.map((fit) => (
            <Button
              key={fit?.id}
              variant={selectedFitType === fit?.id ? 'default' : 'outline'}
              onClick={() => setSelectedFitType(fit?.id)}
              iconName={fit?.icon}
              iconPosition="left"
            >
              {fit?.name}
            </Button>
          ))}
        </div>

        {/* Selected Fit Details */}
        {fitTypes?.map((fit) => (
          selectedFitType === fit?.id && (
            <div key={fit?.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">{fit?.name}</h3>
                <p className="text-text-secondary mb-4">{fit?.description}</p>
                
                <h4 className="font-medium text-text-primary mb-3">Key Characteristics:</h4>
                <ul className="space-y-2">
                  {fit?.characteristics?.map((char, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icon name="Check" size={16} className="text-success mt-0.5" />
                      <span className="text-text-secondary">{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={fit?.image}
                    alt={`${fit?.name} example`}
                    className="w-64 h-80 object-cover rounded-lg shadow-brand"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-2 rounded text-center">
                    <span className="text-sm font-medium">{fit?.name} Example</span>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
      {/* Body Type Guide */}
      <div className="bg-card rounded-xl shadow-brand p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Body Type Styling Guide</h2>
            <p className="text-text-secondary">Celebrate your unique shape with personalized styling tips</p>
          </div>
          <Icon name="Users" size={24} className="text-secondary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bodyTypeGuides?.map((guide, index) => (
            <div key={index} className="border border-border rounded-lg p-6 hover:shadow-brand transition-brand">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${guide?.colors}`}>
                  <Icon name={guide?.icon} size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{guide?.type}</h3>
                  <p className="text-sm text-text-secondary">{guide?.description}</p>
                </div>
              </div>
              
              <h4 className="font-medium text-text-primary mb-3">Styling Tips:</h4>
              <ul className="space-y-2">
                {guide?.recommendations?.map((rec, recIndex) => (
                  <li key={recIndex} className="flex items-start space-x-2">
                    <Icon name="Sparkles" size={14} className="text-secondary mt-1" />
                    <span className="text-sm text-text-secondary">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-surface rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Heart" size={20} className="text-secondary mt-0.5" />
            <div>
              <h4 className="font-medium text-text-primary mb-1">Remember</h4>
              <p className="text-sm text-text-secondary">
                These are general guidelines to help you feel confident. The most important thing is wearing what makes you feel comfortable and expresses your personal style!
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Fabric Guide */}
      <div className="bg-card rounded-xl shadow-brand p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Fabric & Fit Guide</h2>
            <p className="text-text-secondary">How different fabrics affect fit and sizing</p>
          </div>
          <Icon name="Layers" size={24} className="text-secondary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fabricGuides?.map((fabric, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Icon name={fabric?.icon} size={20} className="text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">{fabric?.name}</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Stretch:</span>
                  <span className="font-medium text-text-primary">{fabric?.stretch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Drape:</span>
                  <span className="font-medium text-text-primary">{fabric?.drape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Care:</span>
                  <span className="font-medium text-text-primary">{fabric?.care}</span>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-surface rounded text-xs text-text-secondary">
                <strong>Fit Note:</strong> {fabric?.fit_note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FitGuideSection;