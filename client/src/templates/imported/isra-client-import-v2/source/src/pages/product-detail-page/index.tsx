"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import ProductDetails from './components/ProductDetails';
import CustomerReviews from './components/CustomerReviews';
import CompleteTheLook from './components/CompleteTheLook';
import RecommendedProducts from './components/RecommendedProducts';

const ProductDetailPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  // Mock product data
  const product = {
    id: 1,
    name: "Essential Cotton Blend Crew Neck Sweater",
    brand: "StyleHub Essentials",
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    description: `A timeless wardrobe staple crafted from premium cotton blend fabric. This crew neck sweater offers the perfect balance of comfort and style, featuring a relaxed fit that's ideal for layering or wearing on its own. The soft, breathable material ensures all-day comfort while maintaining its shape wash after wash.`,
    mainImage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
    additionalImages: [
      "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop"
    ],
    sizes: [
      { value: 'XS', label: 'XS', available: true },
      { value: 'S', label: 'S', available: true },
      { value: 'M', label: 'M', available: true },
      { value: 'L', label: 'L', available: true },
      { value: 'XL', label: 'XL', available: false },
      { value: 'XXL', label: 'XXL', available: true }
    ],
    inStock: true,
    stockCount: 12,
    material: "60% Cotton, 40% Polyester",
    style: "Crew Neck Sweater",
    fit: "Relaxed Fit",
    origin: "Made in Portugal",
    sku: "SHE-CNS-001",
    features: [
      "Premium cotton blend construction",
      "Ribbed crew neckline and cuffs",
      "Side seam construction for better fit",
      "Pre-shrunk fabric",
      "Machine washable",
      "Available in multiple colors"
    ]
  };

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      customerName: "Sarah M.",
      rating: 5,
      title: "Perfect everyday sweater!",
      comment: `This sweater exceeded my expectations! The fabric is so soft and comfortable, and the fit is exactly what I was looking for. I've washed it several times and it still looks brand new. Definitely ordering in more colors.`,
      date: "2025-08-25",
      size: "M",
      verified: true,
      helpfulCount: 12,
      photos: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=200&h=200&fit=crop"
      ]
    },
    {
      id: 2,
      customerName: "Michael R.",
      rating: 4,
      title: "Great quality, runs slightly large",
      comment: `Really happy with this purchase. The quality is excellent and the color is exactly as shown. Only reason for 4 stars instead of 5 is that it runs a bit larger than expected - I probably should have ordered a size down.`,
      date: "2025-08-20",
      size: "L",
      verified: true,
      helpfulCount: 8,
      photos: []
    },
    {
      id: 3,
      customerName: "Emma L.",
      rating: 5,
      title: "Love the sustainable materials!",
      comment: `As someone who cares about sustainable fashion, I appreciate that this sweater is made with organic cotton. It's comfortable, stylish, and I feel good about wearing it. The fit is perfect and it layers beautifully.`,
      date: "2025-08-18",
      size: "S",
      verified: true,
      helpfulCount: 15,
      photos: [
        "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=200&h=200&fit=crop"
      ]
    }
  ];

  // Mock outfit items for "Complete the Look"
  const outfitItems = [
    {
      id: 1,
      name: "Essential Cotton Blend Crew Neck Sweater",
      price: 89.99,
      originalPrice: 119.99,
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      name: "High-Waisted Straight Leg Jeans",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop",
      availableSizes: ['26', '27', '28', '29', '30', '31', '32']
    },
    {
      id: 3,
      name: "Classic White Leather Sneakers",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      availableSizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10']
    }
  ];

  // Mock recommended products
  const recommendedProducts = [
    {
      id: 4,
      name: "Cashmere Blend V-Neck Cardigan",
      brand: "StyleHub Premium",
      price: 149.99,
      originalPrice: 199.99,
      discount: 25,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
      rating: 4.8,
      reviewCount: 124,
      isNew: true,
      colors: ['#8B4513', '#000000', '#F5F5DC', '#708090']
    },
    {
      id: 5,
      name: "Merino Wool Turtleneck",
      brand: "StyleHub Essentials",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop",
      rating: 4.6,
      reviewCount: 89,
      colors: ['#000000', '#FFFFFF', '#708090', '#8B4513']
    },
    {
      id: 6,
      name: "Oversized Knit Hoodie",
      brand: "StyleHub Comfort",
      price: 69.99,
      originalPrice: 89.99,
      discount: 22,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      rating: 4.7,
      reviewCount: 156,
      isLowStock: true,
      colors: ['#708090', '#000000', '#F5F5DC']
    },
    {
      id: 7,
      name: "Cotton Blend Henley Shirt",
      brand: "StyleHub Basics",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
      rating: 4.4,
      reviewCount: 67,
      colors: ['#FFFFFF', '#000000', '#4169E1', '#708090']
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (productData) => {
    console.log('Adding to cart:', productData);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAddToWishlist = (productData) => {
    console.log('Adding to wishlist:', productData);
  };

  const handleAddOutfitToCart = (outfitData) => {
    console.log('Adding outfit to cart:', outfitData);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-text-secondary">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 bg-success text-success-foreground px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
          <Icon name="Check" size={18} />
          <span>Added to cart successfully!</span>
        </div>
      )}
      {/* Breadcrumb */}
      <div className="pt-20 pb-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/homepage" className="text-text-secondary hover:text-primary transition-colors">
              Home
            </a>
            <Icon name="ChevronRight" size={16} className="text-border" />
            <a href="/product-catalog" className="text-text-secondary hover:text-primary transition-colors">
              Sweaters
            </a>
            <Icon name="ChevronRight" size={16} className="text-border" />
            <span className="text-primary font-medium">Essential Cotton Blend Crew Neck</span>
          </nav>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Gallery */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <ProductGallery product={product} />
          </div>

          {/* Product Information */}
          <div>
            <ProductInfo
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <ProductDetails product={product} />
        </div>

        {/* Complete the Look */}
        <div className="mb-12">
          <CompleteTheLook
            outfitItems={outfitItems}
            onAddOutfitToCart={handleAddOutfitToCart}
          />
        </div>

        {/* Customer Reviews */}
        <div className="mb-12">
          <CustomerReviews
            reviews={reviews}
            averageRating={4.7}
            totalReviews={reviews?.length}
          />
        </div>

        {/* Recommended Products */}
        <div className="mb-12">
          <RecommendedProducts products={recommendedProducts} />
        </div>
      </main>
      {/* Sticky Add to Cart - Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-primary">${product?.price}</span>
              {product?.originalPrice && (
                <span className="text-sm text-text-secondary line-through">
                  ${product?.originalPrice}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">{product?.name}</p>
          </div>
          <Button
            variant="default"
            size="lg"
            onClick={() => handleAddToCart(product)}
            disabled={!product?.inStock}
          >
            <Icon name="ShoppingBag" size={18} className="mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
      {/* Footer Spacer for Mobile Sticky Bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default ProductDetailPage;