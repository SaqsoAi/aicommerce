"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SizeGuideSection = () => {
  const [selectedBrand, setSelectedBrand] = useState('stylehub');
  const [selectedCategory, setSelectedCategory] = useState('women');

  const brands = [
    { id: 'stylehub', name: 'StyleHub', logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center' },
    { id: 'zara', name: 'Zara', logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop&crop=center' },
    { id: 'hm', name: 'H&M', logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&crop=center' },
    { id: 'asos', name: 'ASOS', logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop&crop=center' }
  ];

  const categories = [
    { id: 'women', name: 'Women', icon: 'User' },
    { id: 'men', name: 'Men', icon: 'UserCheck' },
    { id: 'kids', name: 'Kids', icon: 'Baby' }
  ];

  const sizeCharts = {
    women: {
      tops: [
        { size: 'XS', bust: '32-34', waist: '24-26', hips: '34-36', uk: '6', eu: '34', us: '2' },
        { size: 'S', bust: '34-36', waist: '26-28', hips: '36-38', uk: '8', eu: '36', us: '4' },
        { size: 'M', bust: '36-38', waist: '28-30', hips: '38-40', uk: '10', eu: '38', us: '6' },
        { size: 'L', bust: '38-40', waist: '30-32', hips: '40-42', uk: '12', eu: '40', us: '8' },
        { size: 'XL', bust: '40-42', waist: '32-34', hips: '42-44', uk: '14', eu: '42', us: '10' }
      ],
      bottoms: [
        { size: 'XS', waist: '24-26', hips: '34-36', inseam: '30', uk: '6', eu: '34', us: '2' },
        { size: 'S', waist: '26-28', hips: '36-38', inseam: '30', uk: '8', eu: '36', us: '4' },
        { size: 'M', waist: '28-30', hips: '38-40', inseam: '32', uk: '10', eu: '38', us: '6' },
        { size: 'L', waist: '30-32', hips: '40-42', inseam: '32', uk: '12', eu: '40', us: '8' },
        { size: 'XL', waist: '32-34', hips: '42-44', inseam: '34', uk: '14', eu: '42', us: '10' }
      ]
    },
    men: {
      tops: [
        { size: 'XS', chest: '34-36', waist: '28-30', uk: '34', eu: '44', us: 'XS' },
        { size: 'S', chest: '36-38', waist: '30-32', uk: '36', eu: '46', us: 'S' },
        { size: 'M', chest: '38-40', waist: '32-34', uk: '38', eu: '48', us: 'M' },
        { size: 'L', chest: '40-42', waist: '34-36', uk: '40', eu: '50', us: 'L' },
        { size: 'XL', chest: '42-44', waist: '36-38', uk: '42', eu: '52', us: 'XL' }
      ]
    }
  };

  const [selectedSubCategory, setSelectedSubCategory] = useState('tops');

  return (
    <div className="bg-card rounded-xl shadow-brand p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Size Guide</h2>
          <p className="text-text-secondary">Find your perfect fit with our comprehensive size charts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Ruler" size={20} className="text-secondary" />
          <span className="text-sm text-text-secondary">All measurements in inches</span>
        </div>
      </div>
      {/* Brand Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary mb-3">Select Brand</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {brands?.map((brand) => (
            <button
              key={brand?.id}
              onClick={() => setSelectedBrand(brand?.id)}
              className={`p-4 rounded-lg border-2 transition-brand ${
                selectedBrand === brand?.id
                  ? 'border-primary bg-surface' :'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={brand?.logo}
                  alt={brand?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <span className="text-sm font-medium text-text-primary">{brand?.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Category Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary mb-3">Category</h3>
        <div className="flex space-x-2">
          {categories?.map((category) => (
            <Button
              key={category?.id}
              variant={selectedCategory === category?.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category?.id)}
              iconName={category?.icon}
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              {category?.name}
            </Button>
          ))}
        </div>
      </div>
      {/* Sub-category for Women */}
      {selectedCategory === 'women' && (
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button
              variant={selectedSubCategory === 'tops' ? 'default' : 'outline'}
              onClick={() => setSelectedSubCategory('tops')}
            >
              Tops & Dresses
            </Button>
            <Button
              variant={selectedSubCategory === 'bottoms' ? 'default' : 'outline'}
              onClick={() => setSelectedSubCategory('bottoms')}
            >
              Bottoms
            </Button>
          </div>
        </div>
      )}
      {/* Size Chart Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-text-primary">Size</th>
              {selectedCategory === 'women' && selectedSubCategory === 'tops' && (
                <>
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Bust</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Waist</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Hips</th>
                </>
              )}
              {selectedCategory === 'women' && selectedSubCategory === 'bottoms' && (
                <>
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Waist</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Hips</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Inseam</th>
                </>
              )}
              {selectedCategory === 'men' && (
                <>
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Chest</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Waist</th>
                </>
              )}
              <th className="text-left py-3 px-4 font-medium text-text-primary">UK</th>
              <th className="text-left py-3 px-4 font-medium text-text-primary">EU</th>
              <th className="text-left py-3 px-4 font-medium text-text-primary">US</th>
            </tr>
          </thead>
          <tbody>
            {sizeCharts?.[selectedCategory]?.[selectedSubCategory]?.map((row, index) => (
              <tr key={index} className="border-b border-border hover:bg-surface/50 transition-brand">
                <td className="py-3 px-4 font-medium text-text-primary">{row?.size}</td>
                {selectedCategory === 'women' && selectedSubCategory === 'tops' && (
                  <>
                    <td className="py-3 px-4 text-text-secondary">{row?.bust}</td>
                    <td className="py-3 px-4 text-text-secondary">{row?.waist}</td>
                    <td className="py-3 px-4 text-text-secondary">{row?.hips}</td>
                  </>
                )}
                {selectedCategory === 'women' && selectedSubCategory === 'bottoms' && (
                  <>
                    <td className="py-3 px-4 text-text-secondary">{row?.waist}</td>
                    <td className="py-3 px-4 text-text-secondary">{row?.hips}</td>
                    <td className="py-3 px-4 text-text-secondary">{row?.inseam}</td>
                  </>
                )}
                {selectedCategory === 'men' && (
                  <>
                    <td className="py-3 px-4 text-text-secondary">{row?.chest}</td>
                    <td className="py-3 px-4 text-text-secondary">{row?.waist}</td>
                  </>
                )}
                <td className="py-3 px-4 text-text-secondary">{row?.uk}</td>
                <td className="py-3 px-4 text-text-secondary">{row?.eu}</td>
                <td className="py-3 px-4 text-text-secondary">{row?.us}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan="7" className="py-8 px-4 text-center text-text-secondary">
                  Size chart not available for this category
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 p-4 bg-surface rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-secondary mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary mb-1">Measurement Tips</h4>
            <p className="text-sm text-text-secondary">
              For the most accurate fit, measure yourself while wearing well-fitting undergarments. 
              Keep the measuring tape snug but not tight, and measure over bare skin when possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideSection;