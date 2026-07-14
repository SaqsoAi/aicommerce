"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MeasuringGuideSection = () => {
  const [selectedGuide, setSelectedGuide] = useState('women');
  const [activeVideo, setActiveVideo] = useState(null);

  const measurementGuides = {
    women: {
      title: 'Women\'s Measuring Guide',
      icon: 'User',
      measurements: [
        {
          name: 'Bust',
          description: 'Measure around the fullest part of your bust',
          steps: [
            'Wear a well-fitting, non-padded bra',
            'Keep the measuring tape parallel to the floor',
            'Measure around the fullest part of your bust',
            'Keep the tape snug but not tight'
          ],
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop&crop=center',
          videoId: 'bust-measurement'
        },
        {
          name: 'Waist',
          description: 'Measure around your natural waistline',
          steps: [
            'Find your natural waist (narrowest part of torso)',
            'Usually about 1-2 inches above your belly button',
            'Keep the tape parallel to the floor',
            'Breathe normally and don\'t suck in'
          ],
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center',
          videoId: 'waist-measurement'
        },
        {
          name: 'Hips',
          description: 'Measure around the fullest part of your hips',
          steps: [
            'Stand with feet together',
            'Measure around the fullest part of your hips',
            'Usually about 7-9 inches below your waist',
            'Keep the tape parallel to the floor'
          ],
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=200&fit=crop&crop=center',
          videoId: 'hips-measurement'
        },
        {
          name: 'Inseam',
          description: 'Measure from crotch to desired hem length',
          steps: [
            'Wear well-fitting pants or leggings',
            'Measure from the crotch seam down to ankle',
            'For cropped styles, measure to desired length',
            'Stand straight with feet slightly apart'
          ],
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=200&fit=crop&crop=center',
          videoId: 'inseam-measurement'
        }
      ]
    },
    men: {
      title: 'Men\'s Measuring Guide',
      icon: 'UserCheck',
      measurements: [
        {
          name: 'Chest',
          description: 'Measure around the fullest part of your chest',
          steps: [
            'Keep arms relaxed at your sides',
            'Measure around the fullest part of your chest',
            'Usually just under the armpits',
            'Keep the tape parallel to the floor'
          ],
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center',
          videoId: 'chest-measurement'
        },
        {
          name: 'Waist',
          description: 'Measure around your natural waistline',
          steps: [
            'Find where you normally wear your belt',
            'Usually at or just below your belly button',
            'Keep the tape snug but comfortable',
            'Don\'t suck in your stomach'
          ],
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=center',
          videoId: 'waist-measurement-men'
        },
        {
          name: 'Neck',
          description: 'Measure around the base of your neck',
          steps: [
            'Measure around the base of your neck',
            'Where your shirt collar would sit',
            'Keep one finger between tape and neck',
            'This ensures comfortable shirt fit'
          ],
          image: 'https://images.unsplash.com/photo-1506629905607-d9f02a6a0f7b?w=300&h=200&fit=crop&crop=center',
          videoId: 'neck-measurement'
        },
        {
          name: 'Sleeve Length',
          description: 'Measure from shoulder to wrist',
          steps: [
            'Start at the center back of your neck',
            'Measure over your shoulder to your wrist',
            'Keep your arm slightly bent',
            'Measure to where you want the sleeve to end'
          ],
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop&crop=center',
          videoId: 'sleeve-measurement'
        }
      ]
    }
  };

  const measurementTips = [
    {
      icon: 'Ruler',
      title: 'Use a Soft Measuring Tape',
      description: 'A flexible fabric measuring tape gives the most accurate results. Avoid using a rigid ruler or metal tape measure.'
    },
    {
      icon: 'Users',
      title: 'Get Help When Possible',
      description: 'Having someone else take your measurements ensures better accuracy, especially for hard-to-reach areas.'
    },
    {
      icon: 'Clock',
      title: 'Measure at the Right Time',
      description: 'Take measurements in the morning when you\'re not bloated, and wear minimal, well-fitting undergarments.'
    },
    {
      icon: 'RotateCcw',
      title: 'Double-Check Everything',
      description: 'Take each measurement twice to ensure accuracy. Small differences can affect fit significantly.'
    }
  ];

  const VideoModal = ({ videoId, onClose }) => (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Measurement Tutorial</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>
        <div className="p-4">
          <div className="aspect-video bg-surface rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="Play" size={48} className="text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">Video tutorial for {videoId}</p>
              <p className="text-sm text-text-secondary mt-2">
                This would be an interactive video showing proper measuring technique
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-xl shadow-brand p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Measuring Guide</h2>
          <p className="text-text-secondary">Learn how to take accurate measurements for the perfect fit</p>
        </div>
        <Icon name="Ruler" size={24} className="text-secondary" />
      </div>
      {/* Category Selection */}
      <div className="flex space-x-2 mb-6">
        {Object.entries(measurementGuides)?.map(([key, guide]) => (
          <Button
            key={key}
            variant={selectedGuide === key ? 'default' : 'outline'}
            onClick={() => setSelectedGuide(key)}
            iconName={guide?.icon}
            iconPosition="left"
          >
            {guide?.title}
          </Button>
        ))}
      </div>
      {/* Measurement Instructions */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-text-primary">
          {measurementGuides?.[selectedGuide]?.title}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {measurementGuides?.[selectedGuide]?.measurements?.map((measurement, index) => (
            <div key={index} className="border border-border rounded-lg p-6 hover:shadow-brand transition-brand">
              <div className="flex items-start space-x-4">
                <img
                  src={measurement?.image}
                  alt={`${measurement?.name} measurement`}
                  className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-text-primary">{measurement?.name}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveVideo(measurement?.videoId)}
                      iconName="Play"
                      iconPosition="left"
                    >
                      Watch
                    </Button>
                  </div>
                  <p className="text-text-secondary mb-3">{measurement?.description}</p>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-text-primary text-sm">Steps:</h5>
                    <ol className="space-y-1">
                      {measurement?.steps?.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start space-x-2 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                            {stepIndex + 1}
                          </span>
                          <span className="text-text-secondary">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Measurement Tips */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Pro Measuring Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {measurementTips?.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-surface rounded-lg">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={tip?.icon} size={20} className="text-secondary" />
              </div>
              <div>
                <h4 className="font-medium text-text-primary mb-1">{tip?.title}</h4>
                <p className="text-sm text-text-secondary">{tip?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Tools & Resources */}
      <div className="mt-8 p-6 bg-surface rounded-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Helpful Tools & Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <Icon name="Smartphone" size={32} className="text-secondary mx-auto mb-2" />
            <h4 className="font-medium text-text-primary mb-1">Mobile App</h4>
            <p className="text-sm text-text-secondary">Use our app's camera feature to help with measurements</p>
          </div>
          <div className="text-center p-4">
            <Icon name="Download" size={32} className="text-secondary mx-auto mb-2" />
            <h4 className="font-medium text-text-primary mb-1">Printable Guide</h4>
            <p className="text-sm text-text-secondary">Download and print our measuring guide for reference</p>
          </div>
          <div className="text-center p-4">
            <Icon name="MessageCircle" size={32} className="text-secondary mx-auto mb-2" />
            <h4 className="font-medium text-text-primary mb-1">Expert Help</h4>
            <p className="text-sm text-text-secondary">Chat with our fit specialists for personalized guidance</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button variant="outline" iconName="Download" iconPosition="left">
            Download Guide
          </Button>
          <Button variant="outline" iconName="MessageCircle" iconPosition="left">
            Chat with Expert
          </Button>
        </div>
      </div>
      {/* Video Modal */}
      {activeVideo && (
        <VideoModal
          videoId={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
      {/* Final Tips */}
      <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-success mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary mb-1">Remember</h4>
            <p className="text-sm text-text-secondary">
              Measurements can vary throughout the day and with different undergarments. When in doubt, 
              size up for comfort or contact our fit specialists for personalized advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasuringGuideSection;