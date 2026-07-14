import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendedProducts = ({ products, title = "You Might Also Like" }) => {
  const handleProductClick = (productId) => {
    // Navigate to product detail page
    window.location.href = `/product-detail-page?id=${productId}`;
  };

  const handleAddToWishlist = (product, e) => {
    e?.stopPropagation();
    // Add to wishlist logic
    console.log('Added to wishlist:', product);
  };

  const handleQuickAdd = (product, e) => {
    e?.stopPropagation();
    // Quick add to cart logic
    console.log('Quick add to cart:', product);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
        <Button variant="ghost" size="sm">
          <span className="mr-2">View All</span>
          <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <div
            key={product?.id}
            className="group cursor-pointer"
            onClick={() => handleProductClick(product?.id)}
          >
            <div className="relative aspect-square bg-surface rounded-lg overflow-hidden mb-3">
              <Image
                src={product?.image}
                alt={product?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                    title="Quick Add"
                  >
                    <Icon name="Plus" size={18} />
                  </button>
                  <button
                    onClick={(e) => handleAddToWishlist(product, e)}
                    className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-surface transition-colors"
                    title="Add to Wishlist"
                  >
                    <Icon name="Heart" size={18} />
                  </button>
                </div>
              </div>

              {/* Product Badges */}
              <div className="absolute top-2 left-2 space-y-1">
                {product?.isNew && (
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                    New
                  </span>
                )}
                {product?.discount && (
                  <span className="bg-cta text-cta-foreground px-2 py-1 rounded text-xs font-medium">
                    {product?.discount}% OFF
                  </span>
                )}
                {product?.isLowStock && (
                  <span className="bg-warning text-warning-foreground px-2 py-1 rounded text-xs font-medium">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Wishlist Button - Top Right */}
              <button
                onClick={(e) => handleAddToWishlist(product, e)}
                className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
              >
                <Icon name="Heart" size={16} className="text-text-secondary hover:text-cta" />
              </button>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <div>
                <h3 className="font-medium text-primary text-sm line-clamp-2 group-hover:text-secondary transition-colors">
                  {product?.name}
                </h3>
                <p className="text-xs text-text-secondary">{product?.brand}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-semibold text-primary">${product?.price}</span>
                {product?.originalPrice && product?.originalPrice > product?.price && (
                  <span className="text-sm text-text-secondary line-through">
                    ${product?.originalPrice}
                  </span>
                )}
              </div>

              {/* Rating */}
              {product?.rating && (
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-0.5">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Icon
                        key={index}
                        name="Star"
                        size={12}
                        className={index < Math.floor(product?.rating) ? 'text-warning fill-current' : 'text-border'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary">
                    ({product?.reviewCount})
                  </span>
                </div>
              )}

              {/* Available Colors */}
              {product?.colors && product?.colors?.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-text-secondary">Colors:</span>
                  <div className="flex space-x-1">
                    {product?.colors?.slice(0, 4)?.map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    {product?.colors?.length > 4 && (
                      <span className="text-xs text-text-secondary">
                        +{product?.colors?.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Recently Viewed Section */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-primary">Recently Viewed</h3>
          <Button variant="ghost" size="sm">
            <span className="mr-2">Clear All</span>
            <Icon name="X" size={14} />
          </Button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {products?.slice(0, 6)?.map((product) => (
            <div
              key={`recent-${product?.id}`}
              className="flex-shrink-0 w-20 cursor-pointer group"
              onClick={() => handleProductClick(product?.id)}
            >
              <div className="aspect-square bg-surface rounded-lg overflow-hidden mb-2">
                <Image
                  src={product?.image}
                  alt={product?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <p className="text-xs text-text-secondary line-clamp-2 group-hover:text-primary transition-colors">
                {product?.name}
              </p>
              <p className="text-xs font-medium text-primary">${product?.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;