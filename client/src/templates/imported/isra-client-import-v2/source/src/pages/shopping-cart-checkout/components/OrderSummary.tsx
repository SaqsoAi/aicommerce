import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const OrderSummary = ({ 
  subtotal, 
  shipping, 
  tax, 
  discount, 
  total, 
  discountCode, 
  onDiscountCodeChange, 
  onApplyDiscount,
  discountError,
  isSticky = false 
}) => {
  const handleApplyDiscount = (e) => {
    e?.preventDefault();
    onApplyDiscount(discountCode);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${isSticky ? 'sticky top-24' : ''}`}>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Order Summary</h3>
      {/* Price Breakdown */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Subtotal</span>
          <span className="text-text-primary">${subtotal?.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Shipping</span>
          <span className="text-text-primary">
            {shipping === 0 ? 'Free' : `$${shipping?.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Tax</span>
          <span className="text-text-primary">${tax?.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success">Discount</span>
            <span className="text-success">-${discount?.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t border-border pt-3">
          <div className="flex justify-between font-semibold">
            <span className="text-text-primary">Total</span>
            <span className="text-text-primary text-lg">${total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {/* Discount Code */}
      <form onSubmit={handleApplyDiscount} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Discount code"
              value={discountCode}
              onChange={(e) => onDiscountCodeChange(e?.target?.value)}
              error={discountError}
              className="text-sm"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={!discountCode?.trim()}
          >
            Apply
          </Button>
        </div>
      </form>
      {/* Free Shipping Progress */}
      {subtotal < 75 && (
        <div className="mb-4 p-3 bg-surface rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Truck" size={16} className="text-secondary" />
            <span className="text-sm font-medium text-text-primary">
              Add ${(75 - subtotal)?.toFixed(2)} for free shipping
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / 75) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      {/* Trust Signals */}
      <div className="space-y-2 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <Icon name="Shield" size={14} className="text-success" />
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="RotateCcw" size={14} className="text-success" />
          <span>Free returns within 30 days</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="MessageCircle" size={14} className="text-success" />
          <span>24/7 customer support</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;