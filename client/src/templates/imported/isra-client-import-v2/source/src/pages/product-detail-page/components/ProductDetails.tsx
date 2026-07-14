"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ProductDetails = ({ product }) => {
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { id: 'details', label: 'Details', icon: 'Info' },
    { id: 'sizing', label: 'Size & Fit', icon: 'Ruler' },
    { id: 'care', label: 'Care', icon: 'Shirt' },
    { id: 'sustainability', label: 'Sustainability', icon: 'Leaf' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-primary mb-2">Product Details</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>• Material: {product?.material}</li>
                <li>• Style: {product?.style}</li>
                <li>• Fit: {product?.fit}</li>
                <li>• Origin: {product?.origin}</li>
                <li>• SKU: {product?.sku}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">Features</h4>
              <ul className="space-y-1 text-sm text-text-secondary">
                {product?.features?.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'sizing':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-primary mb-2">Size Guide</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Size</th>
                      <th className="text-left py-2">Chest</th>
                      <th className="text-left py-2">Waist</th>
                      <th className="text-left py-2">Length</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr className="border-b border-border">
                      <td className="py-2">XS</td>
                      <td className="py-2">32-34"</td>
                      <td className="py-2">26-28"</td>
                      <td className="py-2">26"</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2">S</td>
                      <td className="py-2">34-36"</td>
                      <td className="py-2">28-30"</td>
                      <td className="py-2">27"</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2">M</td>
                      <td className="py-2">36-38"</td>
                      <td className="py-2">30-32"</td>
                      <td className="py-2">28"</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2">L</td>
                      <td className="py-2">38-40"</td>
                      <td className="py-2">32-34"</td>
                      <td className="py-2">29"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">Model Info</h4>
              <p className="text-sm text-text-secondary">
                Model is 5'9" and wearing size Medium. Fits true to size with a relaxed fit through the body.
              </p>
            </div>
          </div>
        );
      case 'care':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-primary mb-2">Care Instructions</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center space-x-2">
                  <Icon name="Droplets" size={16} />
                  <span>Machine wash cold with like colors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Sun" size={16} />
                  <span>Tumble dry low or hang to dry</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Zap" size={16} />
                  <span>Iron on low heat if needed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="X" size={16} />
                  <span>Do not bleach or dry clean</span>
                </li>
              </ul>
            </div>
            <div className="bg-surface p-3 rounded-lg">
              <p className="text-sm text-text-secondary">
                <strong>Pro Tip:</strong> Turn garment inside out before washing to preserve color and print quality.
              </p>
            </div>
          </div>
        );
      case 'sustainability':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-primary mb-2">Sustainable Materials</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <Icon name="Leaf" size={16} className="text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Organic Cotton</p>
                    <p className="text-sm text-text-secondary">GOTS certified organic cotton</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Icon name="Recycle" size={16} className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Recycled Polyester</p>
                    <p className="text-sm text-text-secondary">Made from recycled plastic bottles</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">Ethical Production</h4>
              <p className="text-sm text-text-secondary">
                Manufactured in Fair Trade certified facilities with safe working conditions and fair wages for all workers.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab?.id
                  ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-primary'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProductDetails;