import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const StyleItSection = ({ selectedProduct, onProductSelect }) => {
  const complementaryItems = [
    {
      id: 'comp-1',
      name: 'Classic White Blazer',
      brand: 'StyleHub',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
      category: 'Outerwear',
      matchReason: 'Perfect for layering'
    },
    {
      id: 'comp-2',
      name: 'High-Waisted Trousers',
      brand: 'Modern Fit',
      price: 65.99,
      image: 'https://images.unsplash.com/photo-1506629905607-d9d36b10ddac?w=400&h=500&fit=crop',
      category: 'Bottoms',
      matchReason: 'Completes the look'
    },
    {
      id: 'comp-3',
      name: 'Leather Crossbody Bag',
      brand: 'Luxe Leather',
      price: 124.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
      category: 'Accessories',
      matchReason: 'Adds sophistication'
    },
    {
      id: 'comp-4',
      name: 'Block Heel Pumps',
      brand: 'Comfort Plus',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop',
      category: 'Shoes',
      matchReason: 'Professional finish'
    }
  ];

  const outfitSuggestions = [
    {
      id: 'outfit-1',
      name: 'Work to Weekend',
      description: 'Professional yet versatile for after-work events',
      items: ['comp-1', 'comp-2'],
      totalPrice: 155.98,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop'
    },
    {
      id: 'outfit-2',
      name: 'Complete Professional',
      description: 'Full business attire for important meetings',
      items: ['comp-1', 'comp-2', 'comp-3', 'comp-4'],
      totalPrice: 360.97,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop'
    },
    {
      id: 'outfit-3',
      name: 'Smart Casual',
      description: 'Relaxed yet polished for casual Fridays',
      items: ['comp-2', 'comp-3'],
      totalPrice: 190.98,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(price);
  };

  const handleAddOutfitToCart = (outfit) => {
    // Handle adding complete outfit to cart
    console.log('Adding outfit to cart:', outfit);
  };

  if (!selectedProduct) {
    return (
      <div className="bg-surface rounded-lg p-8 text-center">
        <Icon name="Sparkles" size={48} className="text-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-primary mb-2">Style It Up!</h3>
        <p className="text-text-secondary">
          Select a product to see styling suggestions and complete outfit ideas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary flex items-center space-x-2">
            <Icon name="Sparkles" size={20} className="text-secondary" />
            <span>Style It</span>
          </h2>
          <p className="text-text-secondary mt-1">
            Complete your look with these perfectly matched pieces
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onProductSelect(null)}>
          <Icon name="X" size={16} />
        </Button>
      </div>
      {/* Selected Product */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-20 bg-surface rounded-lg overflow-hidden">
            <Image
              src={selectedProduct?.images?.[0]}
              alt={selectedProduct?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-primary">{selectedProduct?.name}</h3>
            <p className="text-sm text-text-secondary">{selectedProduct?.brand}</p>
            <p className="font-semibold text-primary">{formatPrice(selectedProduct?.price)}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-success font-medium">Selected</span>
          </div>
        </div>
      </div>
      {/* Complementary Items */}
      <div className="space-y-4">
        <h3 className="font-medium text-primary">Add These Items</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {complementaryItems?.map((item) => (
            <div key={item?.id} className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-brand transition-shadow duration-200">
              <div className="aspect-[3/4] bg-surface overflow-hidden">
                <Image
                  src={item?.image}
                  alt={item?.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <p className="text-xs text-text-secondary">{item?.brand}</p>
                  <h4 className="font-medium text-primary text-sm line-clamp-2">{item?.name}</h4>
                  <p className="font-semibold text-primary">{formatPrice(item?.price)}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-secondary">
                  <Icon name="Lightbulb" size={12} />
                  <span>{item?.matchReason}</span>
                </div>
                <Button variant="outline" size="sm" fullWidth>
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Complete Outfit Suggestions */}
      <div className="space-y-4">
        <h3 className="font-medium text-primary">Complete Outfits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outfitSuggestions?.map((outfit) => (
            <div key={outfit?.id} className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-brand transition-shadow duration-200">
              <div className="aspect-[3/4] bg-surface overflow-hidden">
                <Image
                  src={outfit?.image}
                  alt={outfit?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-primary">{outfit?.name}</h4>
                  <p className="text-sm text-text-secondary">{outfit?.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-text-secondary">Total: </span>
                    <span className="font-semibold text-primary">{formatPrice(outfit?.totalPrice)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-text-secondary">
                    <Icon name="Package" size={12} />
                    <span>{outfit?.items?.length} items</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    fullWidth
                    onClick={() => handleAddOutfitToCart(outfit)}
                  >
                    Add Complete Outfit
                  </Button>
                  <Button variant="ghost" size="sm" fullWidth>
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Styling Tips */}
      <div className="bg-accent/10 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-secondary mt-0.5" />
          <div>
            <h4 className="font-medium text-primary mb-2">Styling Tips</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Mix textures for visual interest - pair smooth fabrics with textured ones</li>
              <li>• Choose one statement piece and keep other items more neutral</li>
              <li>• Consider the occasion - dress up or down with accessories</li>
              <li>• Play with proportions - balance fitted pieces with looser ones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleItSection;