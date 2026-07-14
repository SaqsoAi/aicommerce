import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const WishlistPreview = ({ wishlists, onViewWishlist, onCreateWishlist }) => {
  const totalItems = wishlists?.reduce((sum, list) => sum + list?.items?.length, 0);

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">My Wishlists</h2>
          <p className="text-sm text-text-secondary">{totalItems} items saved</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateWishlist}
          iconName="Plus"
          iconPosition="left"
        >
          New List
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlists?.map((wishlist) => (
          <div
            key={wishlist?.id}
            className="border border-border rounded-lg p-4 hover:shadow-brand-lg transition-brand cursor-pointer"
            onClick={() => onViewWishlist(wishlist?.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-text-primary">{wishlist?.name}</h3>
              <Icon name="Heart" size={16} className="text-destructive" />
            </div>
            
            <div className="grid grid-cols-3 gap-1 mb-3">
              {wishlist?.items?.slice(0, 3)?.map((item, index) => (
                <Image
                  key={index}
                  src={item?.image}
                  alt={item?.name}
                  className="w-full h-16 object-cover rounded"
                />
              ))}
              {wishlist?.items?.length < 3 && (
                Array.from({ length: 3 - wishlist?.items?.length })?.map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="w-full h-16 bg-muted rounded flex items-center justify-center"
                  >
                    <Icon name="Plus" size={16} className="text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {wishlist?.items?.length} item{wishlist?.items?.length !== 1 ? 's' : ''}
              </span>
              <span className="text-text-secondary">
                Updated {wishlist?.lastUpdated}
              </span>
            </div>
          </div>
        ))}
      </div>
      {wishlists?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Heart" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No wishlists yet</h3>
          <p className="text-text-secondary mb-4">Save items you love to create your first wishlist</p>
          <Button onClick={onCreateWishlist} iconName="Plus" iconPosition="left">
            Create Wishlist
          </Button>
        </div>
      )}
    </div>
  );
};

export default WishlistPreview;