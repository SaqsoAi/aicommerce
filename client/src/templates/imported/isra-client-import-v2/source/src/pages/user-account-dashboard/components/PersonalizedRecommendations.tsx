import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PersonalizedRecommendations = ({ recommendations, onViewProduct, onAddToWishlist }) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Recommended for You</h2>
          <p className="text-sm text-text-secondary">Based on your style profile and purchase history</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/product-catalog'}>
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations?.map((product) => (
          <div key={product?.id} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-lg mb-3">
              <Image
                src={product?.image}
                alt={product?.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                onClick={() => onViewProduct(product?.id)}
              />
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white text-text-primary"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onAddToWishlist(product?.id);
                  }}
                >
                  <Icon name="Heart" size={16} />
                </Button>
              </div>
              {product?.isNew && (
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                    New
                  </span>
                </div>
              )}
              {product?.discount && (
                <div className="absolute bottom-3 left-3">
                  <span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
                    -{product?.discount}%
                  </span>
                </div>
              )}
            </div>
            
            <div onClick={() => onViewProduct(product?.id)}>
              <h3 className="font-medium text-text-primary mb-1 group-hover:text-primary transition-colors">
                {product?.name}
              </h3>
              <p className="text-sm text-text-secondary mb-2">{product?.brand}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {product?.originalPrice && product?.originalPrice !== product?.price && (
                    <span className="text-sm text-text-secondary line-through">
                      ${product?.originalPrice}
                    </span>
                  )}
                  <span className="font-semibold text-text-primary">${product?.price}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={14} className="text-yellow-400 fill-current" />
                  <span className="text-sm text-text-secondary">{product?.rating}</span>
                </div>
              </div>
              
              {product?.reason && (
                <div className="mt-2 flex items-center space-x-1">
                  <Icon name="Sparkles" size={12} className="text-primary" />
                  <span className="text-xs text-primary">{product?.reason}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {recommendations?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Sparkles" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No recommendations yet</h3>
          <p className="text-text-secondary mb-4">Complete your style profile to get personalized recommendations</p>
          <Button onClick={() => window.location.href = '/size-fit-center'}>
            Complete Style Profile
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;