"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AccountSettings = ({ userSettings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'addresses', label: 'Addresses', icon: 'MapPin' },
    { id: 'payments', label: 'Payment Methods', icon: 'CreditCard' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'privacy', label: 'Privacy', icon: 'Shield' }
  ];

  const renderProfileTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={userSettings?.firstName}
          disabled={!isEditing}
          className="bg-surface"
        />
        <Input
          label="Last Name"
          value={userSettings?.lastName}
          disabled={!isEditing}
          className="bg-surface"
        />
      </div>
      <Input
        label="Email Address"
        type="email"
        value={userSettings?.email}
        disabled={!isEditing}
        className="bg-surface"
      />
      <Input
        label="Phone Number"
        type="tel"
        value={userSettings?.phone}
        disabled={!isEditing}
        className="bg-surface"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          value={userSettings?.dateOfBirth}
          disabled={!isEditing}
          className="bg-surface"
        />
        <Input
          label="Gender"
          value={userSettings?.gender}
          disabled={!isEditing}
          className="bg-surface"
        />
      </div>
    </div>
  );

  const renderAddressesTab = () => (
    <div className="space-y-4">
      {userSettings?.addresses?.map((address, index) => (
        <div key={index} className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text-primary">{address?.type}</h4>
            <div className="flex items-center space-x-2">
              {address?.isDefault && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Default
                </span>
              )}
              <Button variant="ghost" size="sm" iconName="Edit" />
              <Button variant="ghost" size="sm" iconName="Trash2" className="text-destructive" />
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            {address?.street}, {address?.city}, {address?.state} {address?.zipCode}
          </p>
        </div>
      ))}
      <Button variant="outline" iconName="Plus" iconPosition="left">
        Add New Address
      </Button>
    </div>
  );

  const renderPaymentMethodsTab = () => (
    <div className="space-y-4">
      {userSettings?.paymentMethods?.map((method, index) => (
        <div key={index} className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="CreditCard" size={20} className="text-text-secondary" />
              <div>
                <p className="font-medium text-text-primary">**** **** **** {method?.last4}</p>
                <p className="text-sm text-text-secondary">{method?.brand} • Expires {method?.expiry}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {method?.isDefault && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Default
                </span>
              )}
              <Button variant="ghost" size="sm" iconName="Edit" />
              <Button variant="ghost" size="sm" iconName="Trash2" className="text-destructive" />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" iconName="Plus" iconPosition="left">
        Add Payment Method
      </Button>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {Object.entries(userSettings?.notifications)?.map(([category, settings]) => (
        <div key={category} className="border-b border-border pb-4 last:border-b-0">
          <h4 className="font-medium text-text-primary mb-3 capitalize">{category?.replace(/([A-Z])/g, ' $1')}</h4>
          <div className="space-y-3">
            {Object.entries(settings)?.map(([type, enabled]) => (
              <div key={type} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary capitalize">
                    {type?.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Receive notifications about {type?.toLowerCase()}
                  </p>
                </div>
                <Button
                  variant={enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => {/* Toggle notification */}}
                >
                  {enabled ? 'On' : 'Off'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-4">
        <h4 className="font-medium text-text-primary mb-2">Data Privacy</h4>
        <p className="text-sm text-text-secondary mb-4">
          Control how your data is used and shared
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-primary">Allow personalized recommendations</span>
            <Button variant="default" size="sm">On</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-primary">Share data with partners</span>
            <Button variant="outline" size="sm">Off</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-primary">Marketing communications</span>
            <Button variant="default" size="sm">On</Button>
          </div>
        </div>
      </div>
      
      <div className="border border-border rounded-lg p-4">
        <h4 className="font-medium text-text-primary mb-2">Account Actions</h4>
        <div className="space-y-3">
          <Button variant="outline" fullWidth iconName="Download">
            Download My Data
          </Button>
          <Button variant="outline" fullWidth iconName="Trash2" className="text-destructive">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'addresses':
        return renderAddressesTab();
      case 'payments':
        return renderPaymentMethodsTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Account Settings</h2>
        {activeTab === 'profile' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            iconName={isEditing ? "X" : "Edit"}
            iconPosition="left"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        )}
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-brand ${
                  activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {renderTabContent()}
          
          {(isEditing && activeTab === 'profile') && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={() => { onUpdateSettings(); setIsEditing(false); }}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;