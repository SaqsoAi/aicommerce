import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MiniCart = ({ isOpen, onClose, items, subtotal, onViewCart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Slide-out Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-brand-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">
              Shopping Cart ({items?.length})
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Icon name="ShoppingBag" size={48} className="text-text-secondary mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Your cart is empty</h3>
                <p className="text-text-secondary mb-4">Add some items to get started</p>
                <Button onClick={onClose}>Continue Shopping</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items?.map((item) => (
                  <div key={item?.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item?.image}
                        alt={item?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary text-sm line-clamp-2">
                        {item?.name}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        Size: {item?.size} • Color: {item?.color}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-text-primary">
                          ${(item?.price * item?.quantity)?.toFixed(2)}
                        </span>
                        <span className="text-xs text-text-secondary">
                          Qty: {item?.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items?.length > 0 && (
            <div className="border-t border-border p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-text-primary">Subtotal:</span>
                <span className="font-semibold text-text-primary text-lg">
                  ${subtotal?.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Button fullWidth onClick={onViewCart}>
                  View Cart & Checkout
                </Button>
                <Button variant="outline" fullWidth onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
              
              <p className="text-xs text-text-secondary text-center">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCart;