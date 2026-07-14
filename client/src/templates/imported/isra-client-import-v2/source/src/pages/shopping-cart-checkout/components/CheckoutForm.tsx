"use client";

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CheckoutForm = ({ onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping Information
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Options
    saveInfo: false,
    createAccount: false,
    sameAsShipping: true,
    shippingMethod: 'standard'
  });

  const [errors, setErrors] = useState({});

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' }
  ];

  const stateOptions = [
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    { value: 'FL', label: 'Florida' }
  ];

  const shippingOptions = [
    { value: 'standard', label: 'Standard Shipping (5-7 days)', price: 0 },
    { value: 'express', label: 'Express Shipping (2-3 days)', price: 9.99 },
    { value: 'overnight', label: 'Overnight Shipping (1 day)', price: 24.99 }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData?.email) newErrors.email = 'Email is required';
      if (!formData?.firstName) newErrors.firstName = 'First name is required';
      if (!formData?.lastName) newErrors.lastName = 'Last name is required';
      if (!formData?.address) newErrors.address = 'Address is required';
      if (!formData?.city) newErrors.city = 'City is required';
      if (!formData?.zipCode) newErrors.zipCode = 'ZIP code is required';
    }
    
    if (step === 2) {
      if (!formData?.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!formData?.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!formData?.cvv) newErrors.cvv = 'CVV is required';
      if (!formData?.cardName) newErrors.cardName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const steps = [
    { number: 1, title: 'Shipping', icon: 'Truck' },
    { number: 2, title: 'Payment', icon: 'CreditCard' },
    { number: 3, title: 'Review', icon: 'CheckCircle' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps?.map((step, index) => (
          <div key={step?.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step?.number
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border text-text-secondary'
            }`}>
              {currentStep > step?.number ? (
                <Icon name="Check" size={16} />
              ) : (
                <Icon name={step?.icon} size={16} />
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= step?.number ? 'text-primary' : 'text-text-secondary'
            }`}>
              {step?.title}
            </span>
            {index < steps?.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${
                currentStep > step?.number ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {/* Step 1: Shipping Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Shipping Information</h3>
            
            <Input
              type="email"
              label="Email Address"
              placeholder="your@email.com"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              error={errors?.email}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                label="First Name"
                placeholder="John"
                value={formData?.firstName}
                onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                error={errors?.firstName}
                required
              />
              <Input
                type="text"
                label="Last Name"
                placeholder="Doe"
                value={formData?.lastName}
                onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                error={errors?.lastName}
                required
              />
            </div>

            <Input
              type="text"
              label="Address"
              placeholder="123 Main Street"
              value={formData?.address}
              onChange={(e) => handleInputChange('address', e?.target?.value)}
              error={errors?.address}
              required
            />

            <Input
              type="text"
              label="Apartment, suite, etc. (optional)"
              placeholder="Apt 4B"
              value={formData?.apartment}
              onChange={(e) => handleInputChange('apartment', e?.target?.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="text"
                label="City"
                placeholder="New York"
                value={formData?.city}
                onChange={(e) => handleInputChange('city', e?.target?.value)}
                error={errors?.city}
                required
              />
              <Select
                label="State"
                options={stateOptions}
                value={formData?.state}
                onChange={(value) => handleInputChange('state', value)}
                placeholder="Select state"
              />
              <Input
                type="text"
                label="ZIP Code"
                placeholder="10001"
                value={formData?.zipCode}
                onChange={(e) => handleInputChange('zipCode', e?.target?.value)}
                error={errors?.zipCode}
                required
              />
            </div>

            <Select
              label="Country"
              options={countryOptions}
              value={formData?.country}
              onChange={(value) => handleInputChange('country', value)}
            />

            <Input
              type="tel"
              label="Phone Number (optional)"
              placeholder="+1 (555) 123-4567"
              value={formData?.phone}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
            />

            {/* Shipping Method */}
            <div className="mt-6">
              <h4 className="font-medium text-text-primary mb-3">Shipping Method</h4>
              <div className="space-y-2">
                {shippingOptions?.map((option) => (
                  <label key={option?.value} className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-surface">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={option?.value}
                        checked={formData?.shippingMethod === option?.value}
                        onChange={(e) => handleInputChange('shippingMethod', e?.target?.value)}
                        className="mr-3"
                      />
                      <span className="text-sm font-medium text-text-primary">{option?.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                      {option?.price === 0 ? 'Free' : `$${option?.price}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleNextStep}>
                Continue to Payment
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Payment Information</h3>
            
            {/* Payment Methods */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <div className="p-3 border border-border rounded-lg flex items-center justify-center">
                <Icon name="CreditCard" size={20} className="text-text-secondary" />
              </div>
              <div className="p-3 border border-border rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-primary">PayPal</span>
              </div>
              <div className="p-3 border border-border rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-text-secondary">Apple Pay</span>
              </div>
              <div className="p-3 border border-border rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-text-secondary">Klarna</span>
              </div>
            </div>

            <Input
              type="text"
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={formData?.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e?.target?.value)}
              error={errors?.cardNumber}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Expiry Date"
                placeholder="MM/YY"
                value={formData?.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e?.target?.value)}
                error={errors?.expiryDate}
                required
              />
              <Input
                type="text"
                label="CVV"
                placeholder="123"
                value={formData?.cvv}
                onChange={(e) => handleInputChange('cvv', e?.target?.value)}
                error={errors?.cvv}
                required
              />
            </div>

            <Input
              type="text"
              label="Cardholder Name"
              placeholder="John Doe"
              value={formData?.cardName}
              onChange={(e) => handleInputChange('cardName', e?.target?.value)}
              error={errors?.cardName}
              required
            />

            <div className="space-y-3 mt-6">
              <Checkbox
                label="Save payment information for future purchases"
                checked={formData?.saveInfo}
                onChange={(e) => handleInputChange('saveInfo', e?.target?.checked)}
              />
              <Checkbox
                label="Create an account for faster checkout"
                checked={formData?.createAccount}
                onChange={(e) => handleInputChange('createAccount', e?.target?.checked)}
              />
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePrevStep}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Shipping
              </Button>
              <Button onClick={handleNextStep}>
                Review Order
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Order Review */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Review Your Order</h3>
            
            {/* Order Summary */}
            <div className="bg-surface rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping to:</span>
                <span className="text-text-primary font-medium">
                  {formData?.firstName} {formData?.lastName}
                </span>
              </div>
              <div className="text-sm text-text-secondary">
                {formData?.address}, {formData?.city}, {formData?.state} {formData?.zipCode}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Payment method:</span>
                <span className="text-text-primary">•••• •••• •••• {formData?.cardNumber?.slice(-4)}</span>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePrevStep}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Payment
              </Button>
              <Button type="submit" loading={isLoading}>
                <Icon name="Lock" size={16} className="mr-2" />
                Complete Order
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;