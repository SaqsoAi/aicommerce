"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StyleProfile = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);

  const stylePersonalities = [
    { id: 'classic', label: 'Classic', icon: 'Crown', color: 'bg-blue-100 text-blue-800' },
    { id: 'trendy', label: 'Trendy', icon: 'Sparkles', color: 'bg-pink-100 text-pink-800' },
    { id: 'casual', label: 'Casual', icon: 'Coffee', color: 'bg-green-100 text-green-800' },
    { id: 'edgy', label: 'Edgy', icon: 'Zap', color: 'bg-purple-100 text-purple-800' },
    { id: 'bohemian', label: 'Bohemian', icon: 'Flower', color: 'bg-orange-100 text-orange-800' }
  ];

  const occasions = [
    { id: 'work', label: 'Work', percentage: 40 },
    { id: 'casual', label: 'Casual', percentage: 35 },
    { id: 'formal', label: 'Formal Events', percentage: 15 },
    { id: 'workout', label: 'Workout', percentage: 10 }
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">My Style Profile</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          iconName={isEditing ? "X" : "Edit"}
          iconPosition="left"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Style Personality */}
        <div>
          <h3 className="font-medium text-text-primary mb-3">Style Personality</h3>
          <div className="flex flex-wrap gap-2">
            {stylePersonalities?.map((style) => (
              <div
                key={style?.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm ${
                  profile?.stylePersonality?.includes(style?.id)
                    ? style?.color
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon name={style?.icon} size={14} />
                <span>{style?.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Colors */}
        <div>
          <h3 className="font-medium text-text-primary mb-3">Favorite Colors</h3>
          <div className="flex flex-wrap gap-2">
            {profile?.preferredColors?.map((color, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-muted text-sm"
              >
                <div
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color?.hex }}
                ></div>
                <span className="text-text-primary">{color?.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Size Preferences */}
        <div>
          <h3 className="font-medium text-text-primary mb-3">Size Preferences</h3>
          <div className="space-y-2">
            {Object.entries(profile?.sizePreferences)?.map(([category, size]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-text-secondary capitalize">{category}:</span>
                <span className="text-sm font-medium text-text-primary">{size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Occasions */}
        <div>
          <h3 className="font-medium text-text-primary mb-3">Shopping Occasions</h3>
          <div className="space-y-3">
            {occasions?.map((occasion) => (
              <div key={occasion?.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-text-secondary">{occasion?.label}</span>
                  <span className="text-sm font-medium text-text-primary">{occasion?.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${occasion?.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Style Quiz Results */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-text-primary">Style Quiz Results</h3>
          <Button variant="ghost" size="sm" iconName="RefreshCw" iconPosition="left">
            Retake Quiz
          </Button>
        </div>
        <div className="bg-surface rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Icon name="Target" size={20} className="text-primary" />
            <span className="font-medium text-text-primary">Your Style Match: {profile?.styleMatch}%</span>
          </div>
          <p className="text-sm text-text-secondary">
            {profile?.styleDescription}
          </p>
        </div>
      </div>
      {isEditing && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={() => { onUpdateProfile(); setIsEditing(false); }}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleProfile;