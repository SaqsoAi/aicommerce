import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CompleteTheLook = ({ outfitItems, onAddOutfitToCart }) => {
  const calculateTotalPrice = () => {
    return outfitItems?.reduce((total, item) => total + item?.price, 0);
  };

  const calculateSavings = () => {
    const originalTotal = outfitItems?.reduce((total, item) => total + (item?.originalPrice || item?.price), 0);
    const currentTotal = calculateTotalPrice();
    return originalTotal - currentTotal;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Complete the Look</h2>
        <div className="text-sm text-text-secondary">
          Save ${calculateSavings()?.toFixed(2)} when you buy together
        </div>
      </div>
      {/* Outfit Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {outfitItems?.map((item, index) => (
          <div key={item?.id} className="group relative">
            <div className="aspect-square bg-surface rounded-lg overflow-hidden mb-3">
              <Image
                src={item?.image}
                alt={item?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  Current Item
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-primary text-sm line-clamp-2">{item?.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-primary">${item?.price}</span>
                {item?.originalPrice && item?.originalPrice > item?.price && (
                  <span className="text-sm text-text-secondary line-through">
                    ${item?.originalPrice}
                  </span>
                )}
              </div>
              
              {/* Size Selection for non-current items */}
              {index !== 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-text-secondary">Size:</span>
                  <select className="text-xs border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring">
                    {item?.availableSizes?.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Outfit Summary */}
      <div className="bg-surface p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Total ({outfitItems?.length} items)</span>
          <span className="font-semibold text-primary">${calculateTotalPrice()?.toFixed(2)}</span>
        </div>
        {calculateSavings() > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success">Bundle Savings</span>
            <span className="text-success font-medium">-${calculateSavings()?.toFixed(2)}</span>
          </div>
        )}
      </div>
      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={() => onAddOutfitToCart(outfitItems)}
          className="h-12"
        >
          <Icon name="ShoppingBag" size={18} className="mr-2" />
          Add Complete Look to Cart
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" fullWidth>
            <Icon name="Heart" size={16} className="mr-2" />
            Save Outfit
          </Button>
          <Button variant="outline" size="sm" fullWidth>
            <Icon name="Share2" size={16} className="mr-2" />
            Share Look
          </Button>
        </div>
      </div>
      {/* Style Tips */}
      <div className="mt-6 p-4 bg-accent/10 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="Lightbulb" size={16} className="text-accent-foreground" />
          </div>
          <div>
            <h4 className="font-medium text-primary mb-1">Styling Tip</h4>
            <p className="text-sm text-text-secondary">
              This versatile combination works perfectly for both casual weekends and smart-casual office days. 
              Layer with a blazer for a more polished look, or add sneakers for a relaxed vibe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteTheLook;