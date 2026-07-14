"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FindYourSizeSection = () => {
  const [activeTab, setActiveTab] = useState('measurements');
  const [measurements, setMeasurements] = useState({
    bust: '',
    waist: '',
    hips: '',
    height: '',
    weight: ''
  });
  const [selectedPurchase, setSelectedPurchase] = useState('');
  const [recommendations, setRecommendations] = useState(null);

  const previousPurchases = [
    {
      id: 1,
      item: 'Floral Summer Dress',
      brand: 'StyleHub',
      size: 'M',
      fit: 'Perfect',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100&h=100&fit=crop&crop=center'
    },
    {
      id: 2,
      item: 'Classic White Shirt',
      brand: 'StyleHub',
      size: 'S',
      fit: 'Slightly loose',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop&crop=center'
    },
    {
      id: 3,
      item: 'High-Waist Jeans',
      brand: 'Zara',
      size: '28',
      fit: 'Perfect',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop&crop=center'
    }
  ];

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateRecommendations = () => {
    // Mock recommendation logic
    const mockRecommendations = [
      {
        brand: 'StyleHub',
        category: 'Tops',
        recommendedSize: 'M',
        confidence: 95,
        notes: 'Based on your measurements, size M should provide a comfortable regular fit.'
      },
      {
        brand: 'StyleHub',
        category: 'Bottoms',
        recommendedSize: '29',
        confidence: 90,
        notes: 'Size 29 recommended for optimal waist and hip fit.'
      },
      {
        brand: 'Zara',
        category: 'Tops',
        recommendedSize: 'S',
        confidence: 85,
        notes: 'Zara tends to run larger, so size S should work well for you.'
      },
      {
        brand: 'H&M',
        category: 'Dresses',
        recommendedSize: 'M',
        confidence: 88,
        notes: 'Size M recommended, consider sizing up for looser fit.'
      }
    ];
    setRecommendations(mockRecommendations);
  };

  const generateFromPurchase = () => {
    if (!selectedPurchase) return;
    
    const purchase = previousPurchases?.find(p => p?.id?.toString() === selectedPurchase);
    const mockRecommendations = [
      {
        brand: 'StyleHub',
        category: 'Similar Items',
        recommendedSize: purchase?.size,
        confidence: 98,
        notes: `Based on your ${purchase?.item} purchase, this size should fit perfectly.`
      },
      {
        brand: 'Zara',
        category: 'Equivalent',
        recommendedSize: purchase?.size === 'M' ? 'S' : purchase?.size === 'S' ? 'XS' : purchase?.size,
        confidence: 85,
        notes: 'Zara sizing tends to run larger than StyleHub.'
      }
    ];
    setRecommendations(mockRecommendations);
  };

  return (
    <div className="bg-card rounded-xl shadow-brand p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Find Your Size</h2>
          <p className="text-text-secondary">Get personalized size recommendations across all brands</p>
        </div>
        <Icon name="Target" size={24} className="text-secondary" />
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-surface rounded-lg p-1">
        <button
          onClick={() => setActiveTab('measurements')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-brand ${
            activeTab === 'measurements' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Ruler" size={16} />
            <span>Enter Measurements</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-brand ${
            activeTab === 'purchases' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Icon name="ShoppingBag" size={16} />
            <span>From Previous Purchase</span>
          </div>
        </button>
      </div>
      {/* Measurements Tab */}
      {activeTab === 'measurements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bust/Chest (inches)"
              type="number"
              placeholder="e.g., 34"
              value={measurements?.bust}
              onChange={(e) => handleMeasurementChange('bust', e?.target?.value)}
            />
            <Input
              label="Waist (inches)"
              type="number"
              placeholder="e.g., 28"
              value={measurements?.waist}
              onChange={(e) => handleMeasurementChange('waist', e?.target?.value)}
            />
            <Input
              label="Hips (inches)"
              type="number"
              placeholder="e.g., 36"
              value={measurements?.hips}
              onChange={(e) => handleMeasurementChange('hips', e?.target?.value)}
            />
            <Input
              label="Height (inches)"
              type="number"
              placeholder="e.g., 65"
              value={measurements?.height}
              onChange={(e) => handleMeasurementChange('height', e?.target?.value)}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={generateRecommendations}
              iconName="Search"
              iconPosition="left"
              disabled={!measurements?.bust || !measurements?.waist || !measurements?.hips}
            >
              Get Size Recommendations
            </Button>
          </div>
        </div>
      )}
      {/* Previous Purchases Tab */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-text-primary">Select a previous purchase:</h3>
            <div className="space-y-3">
              {previousPurchases?.map((purchase) => (
                <div
                  key={purchase?.id}
                  onClick={() => setSelectedPurchase(purchase?.id?.toString())}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-brand ${
                    selectedPurchase === purchase?.id?.toString()
                      ? 'border-primary bg-surface' :'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={purchase?.image}
                      alt={purchase?.item}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{purchase?.item}</h4>
                      <p className="text-sm text-text-secondary">{purchase?.brand}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm">
                          <span className="text-text-secondary">Size:</span>
                          <span className="font-medium text-text-primary ml-1">{purchase?.size}</span>
                        </span>
                        <span className="text-sm">
                          <span className="text-text-secondary">Fit:</span>
                          <span className="font-medium text-success ml-1">{purchase?.fit}</span>
                        </span>
                      </div>
                    </div>
                    {selectedPurchase === purchase?.id?.toString() && (
                      <Icon name="CheckCircle" size={20} className="text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={generateFromPurchase}
              iconName="Search"
              iconPosition="left"
              disabled={!selectedPurchase}
            >
              Get Size Recommendations
            </Button>
          </div>
        </div>
      )}
      {/* Recommendations Results */}
      {recommendations && (
        <div className="mt-8 p-6 bg-surface rounded-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="Target" size={20} className="text-success mr-2" />
            Your Size Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations?.map((rec, index) => (
              <div key={index} className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-text-primary">{rec?.brand}</h4>
                    <p className="text-sm text-text-secondary">{rec?.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">{rec?.recommendedSize}</div>
                    <div className="text-xs text-success">{rec?.confidence}% confident</div>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{rec?.notes}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-start space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success mt-0.5" />
              <p className="text-sm text-success">
                Recommendations saved to your profile for future shopping!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindYourSizeSection;