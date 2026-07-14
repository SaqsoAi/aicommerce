"use client";

import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const SustainabilityCommitment = () => {
  const [animatedValues, setAnimatedValues] = useState({
    carbonReduction: 0,
    recycledMaterials: 0,
    ethicalPartners: 0,
    waterSaved: 0
  });

  const targetValues = {
    carbonReduction: 45,
    recycledMaterials: 78,
    ethicalPartners: 92,
    waterSaved: 2.3
  };

  const sustainabilityMetrics = [
    {
      id: 1,
      icon: 'Leaf',
      title: 'Carbon Footprint Reduction',
      value: animatedValues?.carbonReduction,
      target: targetValues?.carbonReduction,
      unit: '%',
      description: 'Reduced carbon emissions through sustainable practices',
      color: 'text-success'
    },
    {
      id: 2,
      icon: 'Recycle',
      title: 'Recycled Materials',
      value: animatedValues?.recycledMaterials,
      target: targetValues?.recycledMaterials,
      unit: '%',
      description: 'Products made from recycled or upcycled materials',
      color: 'text-secondary'
    },
    {
      id: 3,
      icon: 'Users',
      title: 'Ethical Partners',
      value: animatedValues?.ethicalPartners,
      target: targetValues?.ethicalPartners,
      unit: '%',
      description: 'Suppliers meeting our ethical standards',
      color: 'text-accent'
    },
    {
      id: 4,
      icon: 'Droplets',
      title: 'Water Saved',
      value: animatedValues?.waterSaved,
      target: targetValues?.waterSaved,
      unit: 'M gal',
      description: 'Water conservation through efficient processes',
      color: 'text-primary'
    }
  ];

  const sustainabilityInitiatives = [
    {
      id: 1,
      title: 'Circular Fashion Program',
      description: 'Take back program for worn items to be recycled or upcycled into new pieces',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      status: 'Active',
      impact: '10,000+ items recycled'
    },
    {
      id: 2,
      title: 'Sustainable Materials',
      description: 'Organic cotton, recycled polyester, and innovative eco-friendly fabrics',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400&h=300&fit=crop',
      status: 'Ongoing',
      impact: '60% sustainable materials'
    },
    {
      id: 3,
      title: 'Fair Trade Partnership',
      description: 'Working with certified fair trade suppliers to ensure ethical production',
      image: 'https://images.pixabay.com/photo/2017/08/01/11/48/woman-2564660_1280.jpg?w=400&h=300&fit=crop',
      status: 'Expanding',
      impact: '25+ fair trade partners'
    }
  ];

  useEffect(() => {
    const animateValues = () => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedValues({
          carbonReduction: Math.round(targetValues?.carbonReduction * progress),
          recycledMaterials: Math.round(targetValues?.recycledMaterials * progress),
          ethicalPartners: Math.round(targetValues?.ethicalPartners * progress),
          waterSaved: Math.round(targetValues?.waterSaved * progress * 10) / 10
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    };

    // Start animation after component mounts
    const timeout = setTimeout(animateValues, 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleLearnMore = () => {
    console.log('Learn more about sustainability');
  };

  const handleJoinProgram = () => {
    console.log('Join sustainability program');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-success/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Leaf" size={32} className="text-success" />
            <h2 className="text-3xl sm:text-4xl font-bold text-primary">
              Our Sustainability Commitment
            </h2>
          </div>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Fashion that feels good and does good. We're committed to creating a more sustainable future through responsible practices and transparent reporting.
          </p>
        </div>

        {/* Sustainability Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {sustainabilityMetrics?.map((metric) => (
            <div
              key={metric?.id}
              className="bg-card rounded-lg p-6 shadow-brand hover:shadow-brand-lg transition-all duration-300 text-center hover-lift"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
                  <Icon name={metric?.icon} size={24} className={metric?.color} />
                </div>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-primary">
                  {metric?.value}
                </span>
                <span className="text-lg font-medium text-text-secondary ml-1">
                  {metric?.unit}
                </span>
              </div>
              <h3 className="font-semibold text-primary mb-2">{metric?.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {metric?.description}
              </p>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-surface rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                      metric?.color?.replace('text-', 'bg-')
                    }`}
                    style={{ width: `${(metric?.value / metric?.target) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sustainability Initiatives */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-primary text-center mb-8">
            Our Green Initiatives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sustainabilityInitiatives?.map((initiative) => (
              <div
                key={initiative?.id}
                className="bg-card rounded-lg overflow-hidden shadow-brand hover:shadow-brand-lg transition-all duration-300 hover-lift"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={initiative?.image}
                    alt={initiative?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-success text-success-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {initiative?.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-primary mb-2">
                    {initiative?.title}
                  </h4>
                  <p className="text-text-secondary mb-4 leading-relaxed">
                    {initiative?.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="TrendingUp" size={16} className="text-success" />
                      <span className="text-sm font-medium text-success">
                        {initiative?.impact}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Goals */}
        <div className="bg-card rounded-2xl p-8 shadow-brand mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                2025 Sustainability Goals
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Target" size={20} className="text-success" />
                  <span className="text-text-secondary">
                    100% sustainable materials in core collections
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Target" size={20} className="text-success" />
                  <span className="text-text-secondary">
                    Carbon neutral shipping and packaging
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Target" size={20} className="text-success" />
                  <span className="text-text-secondary">
                    50% reduction in water usage across supply chain
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Target" size={20} className="text-success" />
                  <span className="text-text-secondary">
                    Zero waste to landfill from production
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="inline-block bg-gradient-to-br from-success/10 to-secondary/10 rounded-2xl p-6">
                <Icon name="Award" size={48} className="text-success mx-auto lg:mx-0 mb-4" />
                <h4 className="text-xl font-semibold text-primary mb-2">
                  B-Corp Certified
                </h4>
                <p className="text-text-secondary mb-4">
                  Recognized for meeting the highest standards of social and environmental performance
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLearnMore}
                  iconName="ExternalLink"
                  iconPosition="right"
                >
                  View Certificate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-success/10 to-secondary/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-primary mb-4">
            Join Our Sustainable Fashion Movement
          </h3>
          <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
            Every purchase supports our mission to create positive environmental impact. Together, we can make fashion more sustainable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              size="lg"
              onClick={handleJoinProgram}
              iconName="Leaf"
              iconPosition="left"
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              Shop Sustainable Collection
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleLearnMore}
              iconName="BookOpen"
              iconPosition="left"
            >
              Read Our Impact Report
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilityCommitment;