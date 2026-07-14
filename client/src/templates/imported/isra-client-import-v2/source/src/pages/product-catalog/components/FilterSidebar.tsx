"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange, onClearAll }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    size: true,
    color: true,
    price: true,
    occasion: false,
    style: false,
    sustainability: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleFilterChange = (category, value, checked) => {
    const currentValues = filters?.[category] || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues?.filter(v => v !== value);
    
    onFilterChange(category, newValues);
  };

  const filterSections = [
    {
      id: 'category',
      title: 'Category',
      options: [
        { value: 'tops', label: 'Tops', count: 234 },
        { value: 'bottoms', label: 'Bottoms', count: 189 },
        { value: 'dresses', label: 'Dresses', count: 156 },
        { value: 'outerwear', label: 'Outerwear', count: 98 },
        { value: 'shoes', label: 'Shoes', count: 167 },
        { value: 'accessories', label: 'Accessories', count: 203 }
      ]
    },
    {
      id: 'size',
      title: 'Size',
      options: [
        { value: 'xs', label: 'XS', count: 45 },
        { value: 's', label: 'S', count: 89 },
        { value: 'm', label: 'M', count: 156 },
        { value: 'l', label: 'L', count: 134 },
        { value: 'xl', label: 'XL', count: 78 },
        { value: 'xxl', label: 'XXL', count: 34 }
      ]
    },
    {
      id: 'color',
      title: 'Color',
      type: 'color',
      options: [
        { value: 'black', label: 'Black', color: '#000000', count: 89 },
        { value: 'white', label: 'White', color: '#FFFFFF', count: 76 },
        { value: 'navy', label: 'Navy', color: '#1E3A8A', count: 54 },
        { value: 'beige', label: 'Beige', color: '#F5F5DC', count: 43 },
        { value: 'brown', label: 'Brown', color: '#8B4513', count: 32 },
        { value: 'green', label: 'Green', color: '#22C55E', count: 28 }
      ]
    },
    {
      id: 'price',
      title: 'Price Range',
      options: [
        { value: '0-50', label: 'Under $50', count: 67 },
        { value: '50-100', label: '$50 - $100', count: 123 },
        { value: '100-200', label: '$100 - $200', count: 189 },
        { value: '200-300', label: '$200 - $300', count: 98 },
        { value: '300+', label: '$300+', count: 45 }
      ]
    },
    {
      id: 'occasion',
      title: 'Occasion',
      options: [
        { value: 'work', label: 'Work to Weekend', count: 156 },
        { value: 'date', label: 'Date Night', count: 89 },
        { value: 'casual', label: 'Casual Friday', count: 134 },
        { value: 'formal', label: 'Formal Events', count: 67 },
        { value: 'vacation', label: 'Vacation', count: 78 }
      ]
    },
    {
      id: 'style',
      title: 'Style Personality',
      options: [
        { value: 'minimalist', label: 'Minimalist', count: 98 },
        { value: 'bohemian', label: 'Bohemian', count: 76 },
        { value: 'classic', label: 'Classic', count: 123 },
        { value: 'edgy', label: 'Edgy', count: 54 },
        { value: 'romantic', label: 'Romantic', count: 67 }
      ]
    },
    {
      id: 'sustainability',
      title: 'Sustainability',
      options: [
        { value: 'organic', label: 'Organic Materials', count: 45 },
        { value: 'recycled', label: 'Recycled Fabrics', count: 32 },
        { value: 'ethical', label: 'Ethical Production', count: 67 },
        { value: 'local', label: 'Locally Made', count: 23 }
      ]
    }
  ];

  const activeFilterCount = Object.values(filters)?.flat()?.length;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-full lg:h-auto w-80 bg-background border-r border-border z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border lg:hidden">
          <h2 className="text-lg font-semibold text-primary">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Filter Actions */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-primary">Filters</h3>
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAll}
                className="text-text-secondary hover:text-primary"
              >
                Clear All ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>

        {/* Filter Sections */}
        <div className="p-6 space-y-6">
          {filterSections?.map((section) => (
            <div key={section?.id} className="space-y-3">
              <button
                onClick={() => toggleSection(section?.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <h4 className="font-medium text-primary">{section?.title}</h4>
                <Icon 
                  name={expandedSections?.[section?.id] ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-text-secondary"
                />
              </button>

              {expandedSections?.[section?.id] && (
                <div className="space-y-2">
                  {section?.type === 'color' ? (
                    <div className="grid grid-cols-6 gap-2">
                      {section?.options?.map((option) => (
                        <button
                          key={option?.value}
                          onClick={() => handleFilterChange(section?.id, option?.value, !filters?.[section?.id]?.includes(option?.value))}
                          className={`
                            w-8 h-8 rounded-full border-2 transition-all duration-200
                            ${filters?.[section?.id]?.includes(option?.value) 
                              ? 'border-primary scale-110' :'border-border hover:border-text-secondary'
                            }
                          `}
                          style={{ backgroundColor: option?.color }}
                          title={`${option?.label} (${option?.count})`}
                        >
                          {filters?.[section?.id]?.includes(option?.value) && (
                            <Icon 
                              name="Check" 
                              size={12} 
                              className={option?.color === '#FFFFFF' ? 'text-primary' : 'text-white'}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    section?.options?.map((option) => (
                      <div key={option?.value} className="flex items-center justify-between">
                        <Checkbox
                          label={option?.label}
                          checked={filters?.[section?.id]?.includes(option?.value) || false}
                          onChange={(e) => handleFilterChange(section?.id, option?.value, e?.target?.checked)}
                          className="flex-1"
                        />
                        <span className="text-sm text-text-secondary ml-2">
                          {option?.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Apply Button */}
        <div className="p-6 border-t border-border lg:hidden">
          <Button 
            variant="default" 
            fullWidth 
            onClick={onClose}
          >
            Apply Filters ({activeFilterCount})
          </Button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;