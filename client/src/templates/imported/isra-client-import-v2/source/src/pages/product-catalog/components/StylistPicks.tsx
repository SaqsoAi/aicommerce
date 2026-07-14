import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const StylistPicks = ({ onProductClick }) => {
  const stylistPicks = [
    {
      id: 'pick-1',
      name: 'Silk Midi Dress',
      brand: 'Elegant Essentials',
      price: 145.99,
      originalPrice: 189.99,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
      stylist: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        title: 'Senior Fashion Stylist'
      },
      reason: `"This dress is incredibly versatile - perfect for transitioning from day meetings to evening events. The silk drape is flattering on all body types."`,
      tags: ['Versatile', 'Professional', 'Elegant'],
      rating: 4.8,
      reviewCount: 127
    },
    {
      id: 'pick-2',
      name: 'Cashmere Blend Cardigan',
      brand: 'Cozy Luxe',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop',
      stylist: {
        name: 'Marcus Thompson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        title: 'Menswear Specialist'
      },
      reason: `"A timeless piece that works across seasons. Layer it over everything from t-shirts to button-downs. The quality is exceptional for the price."`,
      tags: ['Timeless', 'Layering', 'Quality'],
      rating: 4.9,
      reviewCount: 89
    },
    {
      id: 'pick-3',
      name: 'High-Rise Wide Leg Jeans',
      brand: 'Denim Dreams',
      price: 78.99,
      originalPrice: 95.99,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop',
      stylist: {
        name: 'Emma Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        title: 'Trend Forecaster'
      },
      reason: `"Wide-leg jeans are having a major moment, and this pair nails the trend. The high rise is universally flattering and the wash is perfect for any season."`,
      tags: ['Trending', 'Flattering', 'Versatile'],
      rating: 4.7,
      reviewCount: 203
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(price);
  };

  const getDiscountPercentage = (price, originalPrice) => {
    if (originalPrice && price < originalPrice) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary flex items-center space-x-2">
            <Icon name="Award" size={20} className="text-secondary" />
            <span>Stylist Picks</span>
          </h2>
          <p className="text-text-secondary mt-1">
            Curated selections from our fashion experts
          </p>
        </div>
        <Button variant="ghost" size="sm">
          View All Picks
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>
      {/* Picks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stylistPicks?.map((pick) => (
          <div 
            key={pick?.id} 
            className="group cursor-pointer"
            onClick={() => onProductClick(pick)}
          >
            {/* Product Image */}
            <div className="relative aspect-[3/4] bg-surface rounded-lg overflow-hidden mb-4">
              <Image
                src={pick?.image}
                alt={pick?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Discount Badge */}
              {getDiscountPercentage(pick?.price, pick?.originalPrice) > 0 && (
                <div className="absolute top-2 left-2">
                  <span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
                    -{getDiscountPercentage(pick?.price, pick?.originalPrice)}%
                  </span>
                </div>
              )}

              {/* Stylist Badge */}
              <div className="absolute top-2 right-2">
                <div className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded flex items-center space-x-1">
                  <Icon name="Award" size={12} />
                  <span>Stylist Pick</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex space-x-2">
                  <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                    <Icon name="Heart" size={14} className="text-text-secondary hover:text-destructive" />
                  </button>
                  <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                    <Icon name="Eye" size={14} className="text-primary" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              {/* Basic Info */}
              <div>
                <p className="text-sm text-text-secondary font-medium">{pick?.brand}</p>
                <h3 className="font-medium text-primary group-hover:text-secondary transition-colors duration-200">
                  {pick?.name}
                </h3>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={12}
                      className={`${
                        i < Math.floor(pick?.rating) 
                          ? 'text-warning fill-current' :'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-text-secondary">
                  {pick?.rating} ({pick?.reviewCount})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-primary">
                  {formatPrice(pick?.price)}
                </span>
                {pick?.originalPrice && pick?.originalPrice > pick?.price && (
                  <span className="text-sm text-text-secondary line-through">
                    {formatPrice(pick?.originalPrice)}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {pick?.tags?.map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs bg-surface text-text-secondary px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stylist Info */}
              <div className="bg-surface rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={pick?.stylist?.avatar}
                      alt={pick?.stylist?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-primary">{pick?.stylist?.name}</p>
                      <Icon name="BadgeCheck" size={14} className="text-secondary" />
                    </div>
                    <p className="text-xs text-text-secondary mb-2">{pick?.stylist?.title}</p>
                    <blockquote className="text-xs text-text-secondary italic line-clamp-3">
                      {pick?.reason}
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button variant="outline" size="sm" fullWidth>
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <div className="bg-accent/10 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Icon name="Users" size={20} className="text-secondary" />
            <h3 className="font-medium text-primary">Meet Our Stylists</h3>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            Get personalized styling advice from our team of fashion experts
          </p>
          <Button variant="secondary" size="sm">
            Book a Styling Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StylistPicks;