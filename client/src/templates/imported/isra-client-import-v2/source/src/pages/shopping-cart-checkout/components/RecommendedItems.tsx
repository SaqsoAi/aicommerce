import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendedItems = ({ items, onAddToCart, title = "Complete Your Look" }) => {
  if (!items || items?.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item) => (
          <div key={item?.id} className="group">
            <div className="relative bg-surface rounded-lg overflow-hidden mb-3">
              <div className="aspect-square">
                <Image
                  src={item?.image}
                  alt={item?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {item?.isNew && (
                <div className="absolute top-2 left-2 bg-cta text-cta-foreground text-xs px-2 py-1 rounded-full">
                  New
                </div>
              )}
              
              {item?.discount && (
                <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                  -{item?.discount}%
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary text-sm line-clamp-2">
                {item?.name}
              </h4>
              
              <p className="text-xs text-text-secondary">{item?.brand}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">
                    ${item?.price?.toFixed(2)}
                  </span>
                  {item?.originalPrice && item?.originalPrice > item?.price && (
                    <span className="text-xs text-text-secondary line-through">
                      ${item?.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={12} className="text-warning fill-current" />
                  <span className="text-xs text-text-secondary">{item?.rating}</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => onAddToCart(item)}
                className="mt-2"
              >
                <Icon name="Plus" size={14} className="mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedItems;